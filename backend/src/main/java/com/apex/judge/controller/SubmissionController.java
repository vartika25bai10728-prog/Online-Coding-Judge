package com.apex.judge.controller;

import com.apex.judge.config.JwtService;
import com.apex.judge.model.Problem;
import com.apex.judge.model.Submission;
import com.apex.judge.model.User;
import com.apex.judge.repository.ProblemRepository;
import com.apex.judge.repository.SubmissionRepository;
import com.apex.judge.repository.UserRepository;
import com.apex.judge.service.JudgeQueueService;
import com.apex.judge.service.SandboxExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    public SubmissionController(
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository,
            JudgeQueueService queueService,
            SandboxExecutor sandboxExecutor,
            JwtService jwtService
    ) {
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.queueService = queueService;
        this.sandboxExecutor = sandboxExecutor;
        this.jwtService = jwtService;
    }

    @PostMapping
    public ResponseEntity<?> submit(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String problemId = body.get("problemId");
        String language = body.get("language");
        String code = body.get("code");

        Problem problem = problemRepository.findById(problemId).orElse(null);
        if (problem == null) return ResponseEntity.badRequest().body(Map.of("error", "Problem not found"));

        User user = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            user = userRepository.findByUsername(username).orElse(null);
        }

        if (user == null) {
            // Default demo coder
            user = userRepository.findAll().stream().findFirst().orElse(null);
        }

        Submission submission = new Submission();
        submission.setId(UUID.randomUUID().toString());
        submission.setProblem(problem);
        submission.setUser(user);
        submission.setLanguage(language);
        submission.setCode(code);
        submission.setStatus("QUEUED");
        submission.setVerdict("PENDING");

        submissionRepository.save(submission);

        // Asynchronous push to Redis queue
        queueService.enqueueSubmission(submission.getId());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "submissionId", submission.getId(),
                "status", "QUEUED",
                "message", "Submission received and queued for execution"
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSubmission(@PathVariable String id) {
        return submissionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> getSubmissions(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String problemId
    ) {
        if (userId != null) {
            return ResponseEntity.ok(submissionRepository.findByUserIdOrderByCreatedAtDesc(userId));
        }
        if (problemId != null) {
            return ResponseEntity.ok(submissionRepository.findByProblemIdOrderByCreatedAtDesc(problemId));
        }
        return ResponseEntity.ok(submissionRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/run")
    public ResponseEntity<?> runQuickTest(@RequestBody Map<String, Object> body) {
        String language = (String) body.get("language");
        String code = (String) body.get("code");
        List<Map<String, String>> customCases = (List<Map<String, String>>) body.get("customCases");

        if (customCases == null || customCases.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No test cases provided"));
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
