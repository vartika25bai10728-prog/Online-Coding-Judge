package com.apex.judge.service;

import com.apex.judge.model.TestCase;
import com.apex.judge.model.Verdict;
import com.apex.judge.service.SandboxExecutor.ExecutionResult;
import com.apex.judge.service.executor.CodeExecutor;
import com.apex.judge.service.executor.JavaCodeExecutor;
import com.apex.judge.service.executor.PythonCodeExecutor;
import com.apex.judge.service.strategy.DefaultJudgeStrategy;
import com.apex.judge.service.strategy.JudgeStrategy;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JudgeOopArchitectureTest {

    @Test
    public void testPolymorphicExecutors() {
        CodeExecutor javaExecutor = new JavaCodeExecutor();
        CodeExecutor pythonExecutor = new PythonCodeExecutor();

        assertTrue(javaExecutor.supportsLanguage("java"));
        assertFalse(javaExecutor.supportsLanguage("python"));

        assertTrue(pythonExecutor.supportsLanguage("python"));
        assertFalse(pythonExecutor.supportsLanguage("java"));
    }

    @Test
    public void testJudgeStrategyAcceptance() {
        JudgeStrategy strategy = new DefaultJudgeStrategy();

        TestCase tc = new TestCase();
        tc.setInput("5\n");
        tc.setExpectedOutput("10\n");

        ExecutionResult result = new ExecutionResult();
        result.exitCode = 0;
        result.stdout = "10\r\n"; // Whitespace normalization check
        result.stderr = "";
        result.durationMs = 25;

        Verdict verdict = strategy.evaluate(tc, result);
        assertEquals(Verdict.ACCEPTED, verdict);
    }

    @Test
    public void testJudgeStrategyWrongAnswer() {
        JudgeStrategy strategy = new DefaultJudgeStrategy();

        TestCase tc = new TestCase();
        tc.setInput("5\n");
        tc.setExpectedOutput("10\n");

        ExecutionResult result = new ExecutionResult();
        result.exitCode = 0;
        result.stdout = "42\n";
        result.stderr = "";
        result.durationMs = 25;

        Verdict verdict = strategy.evaluate(tc, result);
        assertEquals(Verdict.WRONG_ANSWER, verdict);
    }

    @Test
    public void testJudgeStrategyTimeLimitExceeded() {
        JudgeStrategy strategy = new DefaultJudgeStrategy();

        TestCase tc = new TestCase();
        tc.setExpectedOutput("10");

        ExecutionResult result = new ExecutionResult();
        result.timedOut = true;
        result.exitCode = 124;

        Verdict verdict = strategy.evaluate(tc, result);
        assertEquals(Verdict.TIME_LIMIT_EXCEEDED, verdict);
    }
}
