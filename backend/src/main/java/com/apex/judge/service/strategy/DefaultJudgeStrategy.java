package com.apex.judge.service.strategy;

import com.apex.judge.model.TestCase;
import com.apex.judge.model.Verdict;
import com.apex.judge.service.SandboxExecutor.ExecutionResult;
import org.springframework.stereotype.Component;

/**
 * Standard judge evaluation strategy.
 * Implements token-level and line-by-line whitespace-tolerant output comparisons.
 * Demonstrates:
 * - Strategy implementation
 * - String manipulation (trim, split, replace)
 * - Conditional branching (if-else, switch)
 */
@Component
public class DefaultJudgeStrategy implements JudgeStrategy {

    @Override
    public Verdict evaluate(TestCase testCase, ExecutionResult result) {
        if (result == null) {
            return Verdict.RUNTIME_ERROR;
        }

        if (result.timedOut) {
            return Verdict.TIME_LIMIT_EXCEEDED;
        }

        if (result.exitCode != 0) {
            if (result.stderr != null && result.stderr.toLowerCase().contains("outofmemory")) {
                return Verdict.MEMORY_LIMIT_EXCEEDED;
            }
            if (result.stderr != null && result.stderr.toLowerCase().contains("compilation error")) {
                return Verdict.COMPILATION_ERROR;
            }
            return Verdict.RUNTIME_ERROR;
        }

        String actual = normalizeOutput(result.stdout);
        String expected = normalizeOutput(testCase.getExpectedOutput());

        if (actual.equals(expected)) {
            return Verdict.ACCEPTED;
        }

        return Verdict.WRONG_ANSWER;
    }

    /**
     * Normalizes output by trimming trailing whitespace per line and carriage returns.
     */
    private String normalizeOutput(String text) {
        if (text == null) {
            return "";
        }
        String[] lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            String trimmedLine = lines[i].stripTrailing();
            if (i > 0) {
                sb.append("\n");
            }
            sb.append(trimmedLine);
        }
        return sb.toString().trim();
    }
}
