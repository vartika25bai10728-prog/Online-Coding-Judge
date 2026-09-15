package com.apex.judge.service.strategy;

import com.apex.judge.model.TestCase;
import com.apex.judge.model.Verdict;
import com.apex.judge.service.SandboxExecutor.ExecutionResult;

/**
 * Strategy interface defining how test case outputs are evaluated.
 * Demonstrates Strategy Pattern and Polymorphism in Java.
 */
public interface JudgeStrategy {

    /**
     * Compares the actual execution output against the expected test case output.
     *
     * @param testCase the reference test case with expected output
     * @param result   the actual child process execution result
     * @return Verdict (ACCEPTED, WRONG_ANSWER, TIME_LIMIT_EXCEEDED, RUNTIME_ERROR, etc.)
     */
    Verdict evaluate(TestCase testCase, ExecutionResult result);
}
