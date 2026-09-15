package com.apex.judge.service;

import com.apex.judge.model.Problem;
import com.apex.judge.model.Submission;
import com.apex.judge.model.SubmissionStatus;
import com.apex.judge.model.TestCase;
import com.apex.judge.model.Verdict;
import com.apex.judge.repository.ProblemRepository;
import com.apex.judge.repository.SubmissionRepository;
import com.apex.judge.repository.UserRepository;
import jakarta.annotation.PreDestroy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class JudgeWorkerService {

    private final JudgeQueueService queueService;
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final SandboxExecutor sandboxExecutor;
    private final SimpMessagingTemplate messagingTemplate;
    private final JudgeConcurrencyManager concurrencyManager;
    private final com.apex.judge.service.strategy.JudgeStrategy judgeStrategy;

    // Concurrency: Fixed thread pool executing judging tasks in parallel
    private final ExecutorService judgeThreadPool = Executors.newFixedThreadPool(4, r -> {
        Thread thread = new Thread(r);
        thread.setName("Judge-Worker-Thread-" + thread.getId());
        thread.setDaemon(true);
        return thread;
    });

    public JudgeWorkerService(
            JudgeQueueService queueService,
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository,
            SandboxExecutor sandboxExecutor,
            SimpMessagingTemplate messagingTemplate,
            JudgeConcurrencyManager concurrencyManager,
            com.apex.judge.service.strategy.JudgeStrategy judgeStrategy
    ) {
        this.queueService = queueService;
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
        this.sandboxExecutor = sandboxExecutor;
        this.messagingTemplate = messagingTemplate;
        this.concurrencyManager = concurrencyManager;
        this.judgeStrategy = judgeStrategy;
    }

    /**
     * Polling daemon: dequeues submission tasks from Redis and dispatches them
     * to worker threads in the ExecutorService pool.
     */
    @Scheduled(fixedDelay = 200)
    public void processQueue() {
        try {
            String submissionId = queueService.dequeueSubmission(Duration.ofMillis(200));
            if (submissionId != null) {
                judgeThreadPool.submit(() -> judgeSubmission(submissionId));
            }
        } catch (Exception e) {
            // Queue polling or connection idle
        }
    }

    @Transactional
    public void judgeSubmission(String submissionId) {
        Submission submission = submissionRepository.findById(submissionId).orElse(null);
        if (submission == null) return;

        concurrencyManager.registerExecutionStart();
        long maxRuntime = 0;
        Problem problem = submission.getProblem();

        try {
            // Step 1: Mark Compiling & Broadcast via WebSocket
            submission.setStatus(SubmissionStatus.COMPILING);
            submissionRepository.save(submission);
            broadcastStatus(submission);

            List<TestCase> testCases = problem.getTestCases();
            submission.setTotalTests(testCases.size());

            // Step 2: Mark Running
            submission.setStatus(SubmissionStatus.RUNNING);
            submissionRepository.save(submission);
            broadcastStatus(submission);

            int passedCount = 0;
            Verdict finalVerdict = Verdict.ACCEPTED;

            for (TestCase tc : testCases) {
                SandboxExecutor.ExecutionResult res = sandboxExecutor.execute(
                        submission.getLanguage(),
                        submission.getCode(),
                        tc.getInput(),
                        problem.getTimeLimitMs(),
                        problem.getMemoryLimitMb()
                );

                if (res.durationMs > maxRuntime) maxRuntime = res.durationMs;

                Verdict testVerdict = judgeStrategy.evaluate(tc, res);
                if (testVerdict == Verdict.ACCEPTED) {
                    passedCount++;
                } else {
                    finalVerdict = testVerdict;
                    if (res.stderr != null && !res.stderr.isEmpty()) {
                        submission.setRuntimeError(res.stderr);
                    }
                    break;
                }
            }

            // Step 3: Finalize Verdict
            submission.setStatus(SubmissionStatus.COMPLETED);
            submission.setVerdict(finalVerdict);
            submission.setPassedTests(passedCount);
            submission.setRuntimeMs((int) maxRuntime);
            submission.setMemoryMb(36);

            submissionRepository.save(submission);
            broadcastStatus(submission);

            // Update problem & user stats
            problem.setTotalSubmissions(problem.getTotalSubmissions() + 1);
            if (finalVerdict == Verdict.ACCEPTED) {
                problem.setTotalAccepted(problem.getTotalAccepted() + 1);
            }
            if (problem.getTotalSubmissions() > 0) {
                problem.setAcceptanceRate((double) problem.getTotalAccepted() / problem.getTotalSubmissions() * 100.0);
            }
            problemRepository.save(problem);

        } catch (Exception e) {
            submission.setStatus(SubmissionStatus.COMPLETED);
            submission.setVerdict(Verdict.RUNTIME_ERROR);
            submission.setRuntimeError(e.getMessage());
            submissionRepository.save(submission);
            broadcastStatus(submission);
        } finally {
            concurrencyManager.recordExecutionCompletion(problem != null ? problem.getId() : null, maxRuntime);
        }
    }

    @PreDestroy
    public void shutdownPool() {
        judgeThreadPool.shutdown();
        try {
            if (!judgeThreadPool.awaitTermination(3, TimeUnit.SECONDS)) {
                judgeThreadPool.shutdownNow();
            }
        } catch (InterruptedException e) {
            judgeThreadPool.shutdownNow();
            Thread.currentThread().interrupt();
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
