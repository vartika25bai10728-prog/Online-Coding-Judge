package com.apex.judge.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.*;

class JudgeConcurrencyManagerTest {

    @Test
    @DisplayName("Should safely handle concurrent updates to shared counters using synchronization")
    void testConcurrentExecutionTracking() throws InterruptedException {
        JudgeConcurrencyManager manager = new JudgeConcurrencyManager();
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            final int id = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    manager.registerExecutionStart();
                    Thread.sleep(20);
                    manager.recordExecutionCompletion("prob-1", 100 + id * 10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        finishLatch.await();
        executor.shutdown();

        assertEquals(0, manager.getActiveWorkers());
        assertEquals(10, manager.getTotalEvaluationsProcessed());
        assertTrue(manager.getPeakConcurrentWorkers() >= 1);
        assertEquals(100L, manager.getFastestRuntimeForProblem("prob-1"));
    }
}
