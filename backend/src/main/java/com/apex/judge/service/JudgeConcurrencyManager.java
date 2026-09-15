package com.apex.judge.service;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Thread-safe monitor tracking live judge execution metrics across concurrent worker threads.
 * Uses explicit method synchronization to protect shared mutable counters and maps
 * from race conditions during parallel submission evaluation.
 */
@Component
public class JudgeConcurrencyManager {

    private int activeWorkers = 0;
    private int peakConcurrentWorkers = 0;
    private long totalEvaluationsProcessed = 0;
    private final Map<String, Long> fastestProblemRuntimeMs = new HashMap<>();

    /**
     * Synchronized entrypoint called when a worker thread begins judging a submission.
     * Prevents non-atomic increment race conditions on active and peak worker counters.
     */
    public synchronized void registerExecutionStart() {
        activeWorkers++;
        if (activeWorkers > peakConcurrentWorkers) {
            peakConcurrentWorkers = activeWorkers;
        }
    }

    /**
     * Synchronized completion method called when a worker thread finishes evaluating a submission.
     * Ensures atomic decrement, total counter increment, and safe updates to fastest runtime map.
     */
    public synchronized void recordExecutionCompletion(String problemId, long executionDurationMs) {
        if (activeWorkers > 0) {
            activeWorkers--;
        }
        totalEvaluationsProcessed++;

        if (problemId != null && executionDurationMs > 0) {
            Long currentFastest = fastestProblemRuntimeMs.get(problemId);
            if (currentFastest == null || executionDurationMs < currentFastest) {
                fastestProblemRuntimeMs.put(problemId, executionDurationMs);
            }
        }
    }

    public synchronized int getActiveWorkers() {
        return activeWorkers;
    }

    public synchronized int getPeakConcurrentWorkers() {
        return peakConcurrentWorkers;
    }

    public synchronized long getTotalEvaluationsProcessed() {
        return totalEvaluationsProcessed;
    }

    public synchronized Long getFastestRuntimeForProblem(String problemId) {
        return fastestProblemRuntimeMs.get(problemId);
    }

    public synchronized Map<String, Long> getFastestRuntimesSnapshot() {
        return Collections.unmodifiableMap(new HashMap<>(fastestProblemRuntimeMs));
    }
}
