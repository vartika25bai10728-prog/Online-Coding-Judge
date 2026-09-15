package com.apex.judge.controller;

import com.apex.judge.config.JwtService;
import com.apex.judge.exception.InvalidSubmissionException;
import com.apex.judge.exception.ResourceNotFoundException;
import com.apex.judge.model.Problem;
import com.apex.judge.model.Submission;
import com.apex.judge.model.SubmissionStatus;
import com.apex.judge.model.User;
import com.apex.judge.model.Verdict;
import com.apex.judge.repository.ProblemRepository;
import com.apex.judge.repository.SubmissionRepository;
import com.apex.judge.repository.SystemStatsJdbcRepository;
import com.apex.judge.repository.UserRepository;
import com.apex.judge.service.JudgeConcurrencyManager;
import com.apex.judge.service.JudgeQueueService;
import com.apex.judge.service.SandboxExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.*;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final JudgeQueueService queueService;
    private final SandboxExecutor sandboxExecutor;
    private final JwtService jwtService;
    private final SystemStatsJdbcRepository statsJdbcRepository;
    private final JudgeConcurrencyManager concurrencyManager;

    public SubmissionController(
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository,
            JudgeQueueService queueService,
            SandboxExecutor sandboxExecutor,
            JwtService jwtService,
            SystemStatsJdbcRepository statsJdbcRepository,
            JudgeConcurrencyManager concurrencyManager
    ) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.queueService = queueService;
        this.sandboxExecutor = sandboxExecutor;
        this.jwtService = jwtService;
        this.statsJdbcRepository = statsJdbcRepository;
        this.concurrencyManager = concurrencyManager;
    }

    @PostMapping
    public ResponseEntity<?> submit(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String problemId = body.get("problemId");
        String language = body.get("language");
        String code = body.get("code");

        if (problemId == null || problemId.isBlank()) {
            throw new InvalidSubmissionException("problemId is required");
        }
        if (code == null || code.isBlank()) {
            throw new InvalidSubmissionException("Solution code cannot be empty");
        }
        if (language == null || language.isBlank()) {
            throw new InvalidSubmissionException("Programming language must be specified");
        }

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "id", problemId));

        User user = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            user = userRepository.findByUsername(username).orElse(null);
        }

        if (user == null) {
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }

        Submission submission = new Submission();
        submission.setId(UUID.randomUUID().toString());
        submission.setProblem(problem);
        submission.setUser(user);
        submission.setLanguage(language);
        submission.setCode(code);
        submission.setStatus(SubmissionStatus.QUEUED);
        submission.setVerdict(Verdict.PENDING);

        submissionRepository.save(submission);

        // Push to Redis FIFO queue
        queueService.enqueueSubmission(submission.getId());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "submissionId", submission.getId(),
                "status", submission.getStatus().name(),
                "verdict", submission.getVerdict().name(),
                "message", "Submission received and queued for execution"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable String id) {
        return submissionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", id));
    }

    @GetMapping
    public ResponseEntity<?> getSubmissions(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String problemId,
            @RequestParam(required = false, defaultValue = "false") boolean acceptedOnly,
            @RequestParam(required = false, defaultValue = "false") boolean fastestOnly
    ) {
        // Explicit JPQL Query: Accepted solutions by user
        if (userId != null && acceptedOnly) {
            return ResponseEntity.ok(submissionRepository.findAcceptedSubmissionsByUser(userId));
        }

        // Explicit JPQL Query: Fastest accepted submissions for problem
        if (problemId != null && fastestOnly) {
            return ResponseEntity.ok(submissionRepository.findFastestSubmissionsForProblem(problemId, Verdict.ACCEPTED));
        }

        if (userId != null) {
            return ResponseEntity.ok(submissionRepository.findByUserIdOrderByCreatedAtDesc(userId));
        }
        if (problemId != null) {
            return ResponseEntity.ok(submissionRepository.findByProblemIdOrderByCreatedAtDesc(problemId));
        }
        return ResponseEntity.ok(submissionRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Demonstrates Raw JDBC direct SQL reporting query via PreparedStatement & ResultSet.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getPlatformStatistics() throws SQLException {
        SystemStatsJdbcRepository.PlatformStatistics stats = statsJdbcRepository.fetchAggregatedStatistics();
        return ResponseEntity.ok(stats);
    }

    /**
     * Exposes synchronized concurrency metrics from the worker thread pool monitor.
     */
    @GetMapping("/concurrency-stats")
    public ResponseEntity<?> getConcurrencyStats() {
        return ResponseEntity.ok(Map.of(
                "activeWorkers", concurrencyManager.getActiveWorkers(),
                "peakConcurrentWorkers", concurrencyManager.getPeakConcurrentWorkers(),
                "totalEvaluationsProcessed", concurrencyManager.getTotalEvaluationsProcessed(),
                "fastestRuntimes", concurrencyManager.getFastestRuntimesSnapshot()
        ));
    }

    @PostMapping("/run")
    public ResponseEntity<?> runQuickTest(@RequestBody Map<String, Object> body) {
        String language = (String) body.get("language");
        String code = (String) body.get("code");
        List<Map<String, String>> customCases = (List<Map<String, String>>) body.get("customCases");

        if (customCases == null || customCases.isEmpty()) {
            throw new InvalidSubmissionException("At least one test case must be provided for test runs");
        }

        List<Map<String, Object>> results = new ArrayList<>();
        for (int i = 0; i < customCases.size(); i++) {
            Map<String, String> tc = customCases.get(i);
            String input = tc.get("input");
            String expected = tc.get("expectedOutput");

            SandboxExecutor.ExecutionResult exec = sandboxExecutor.execute(language, code, input, 2000, 256);
            String normalizedActual = exec.stdout != null ? exec.stdout.trim().replaceAll("\\r\\n", "\n") : "";
            String normalizedExpected = expected != null ? expected.trim().replaceAll("\\r\\n", "\n") : "";

            boolean passed = normalizedActual.equals(normalizedExpected);

            results.add(Map.of(
                    "testCaseIndex", i,
                    "input", input != null ? input : "",
                    "expectedOutput", expected != null ? expected : "",
                    "actualOutput", normalizedActual,
                    "passed", passed,
                    "runtimeMs", exec.durationMs,
                    "error", exec.stderr != null ? exec.stderr : ""
            ));
        }

        return ResponseEntity.ok(results);
    }
}
