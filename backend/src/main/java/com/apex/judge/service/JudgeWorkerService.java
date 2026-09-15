package com.apex.judge.service;

import com.apex.judge.model.Problem;
import com.apex.judge.model.Submission;
import com.apex.judge.model.TestCase;
import com.apex.judge.repository.ProblemRepository;
import com.apex.judge.repository.SubmissionRepository;
import com.apex.judge.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
public class JudgeWorkerService {

    private final JudgeQueueService queueService;
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final SandboxExecutor sandboxExecutor;
    private final SimpMessagingTemplate messagingTemplate;

    public JudgeWorkerService(
            JudgeQueueService queueService,
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository,
            SandboxExecutor sandboxExecutor,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.queueService = queueService;
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.sandboxExecutor = sandboxExecutor;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Continuous background polling worker for Redis submission queue
     */
    @Scheduled(fixedDelay = 200)
    public void processQueue() {
        try {
            String submissionId = queueService.dequeueSubmission(Duration.ofMillis(200));
            if (submissionId != null) {
                judgeSubmission(submissionId);
            }
        } catch (Exception e) {
            // Queue polling error or connection idle
        }
    }

    @Transactional
    public void judgeSubmission(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId).orElse(null);
        if (submission == null) return;

        try {
            // Step 1: Mark Compiling & Broadcast
            submission.setStatus("COMPILING");
            submissionRepository.save(submission);
            broadcastStatus(submission);

            Problem problem = submission.getProblem();
            List<TestCase> testCases = problem.getTestCases();
            submission.setTotalTests(testCases.size());

            // Step 2: Mark Running
            submission.setStatus("RUNNING");
            submissionRepository.save(submission);
            broadcastStatus(submission);

            long maxRuntime = 0;
            int passedCount = 0;
            String finalVerdict = "ACCEPTED";

            for (TestCase tc : testCases) {
                SandboxExecutor.ExecutionResult res = sandboxExecutor.execute(
                        submission.getLanguage(),
                        submission.getCode(),
                        tc.getInput(),
                        problem.getTimeLimitMs(),
                        problem.getMemoryLimitMb()
                );

                if (res.durationMs > maxRuntime) maxRuntime = res.durationMs;

                if (res.timedOut) {
                    finalVerdict = "TIME_LIMIT_EXCEEDED";
                    break;
                }

                if (res.exitCode != 0) {
                    finalVerdict = "RUNTIME_ERROR";
                    submission.setRuntimeError(res.stderr);
                    break;
                }

                // Normalize output check
                if (normalize(res.stdout).equals(normalize(tc.getExpectedOutput()))) {
                    passedCount++;
                } else {
                    finalVerdict = "WRONG_ANSWER";
                    break;
                }
            }

            // Step 3: Finalize Verdict
            submission.setStatus("COMPLETED");
            submission.setVerdict(finalVerdict);
            submission.setPassedTests(passedCount);
            submission.setRuntimeMs((int) maxRuntime);
            submission.setMemoryMb(36);

            submissionRepository.save(submission);
            broadcastStatus(submission);

            // Update problem & user stats
            problem.setTotalSubmissions(problem.getTotalSubmissions() + 1);
            if ("ACCEPTED".equals(finalVerdict)) {
                problem.setTotalAccepted(problem.getTotalAccepted() + 1);
            }
            if (problem.getTotalSubmissions() > 0) {
                problem.setAcceptanceRate((double) problem.getTotalAccepted() / problem.getTotalSubmissions() * 100.0);
            }
            problemRepository.save(problem);

        } catch (Exception e) {
            submission.setStatus("COMPLETED");
            submission.setVerdict("RUNTIME_ERROR");
            submission.setRuntimeError(e.getMessage());
            submissionRepository.save(submission);
            broadcastStatus(submission);
        }
    }

    private void broadcastStatus(Submission submission) {
        try {
            messagingTemplate.convertAndSend("/topic/submissions/" + submission.getId(), submission);
        } catch (Exception ignored) {}
    }

    private String normalize(String output) {
        if (output == null) return "";
        return output.trim().replaceAll("\\r\\n", "\n").replaceAll("[ \\t]+$", "");
    }
}
