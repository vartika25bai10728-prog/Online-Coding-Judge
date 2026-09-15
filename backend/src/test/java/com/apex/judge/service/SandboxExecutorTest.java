package com.apex.judge.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SandboxExecutorTest {

    private final SandboxExecutor sandboxExecutor = new SandboxExecutor();

    @Test
    @DisplayName("Should reject unsupported language gracefully with error verdict")
    void testUnsupportedLanguage() {
        SandboxExecutor.ExecutionResult result = sandboxExecutor.execute(
                "fortran",
                "PROGRAM HELLO\nEND",
                "",
                1000,
                128
        );

        assertNotNull(result);
        assertEquals(1, result.exitCode);
        assertTrue(result.stderr.contains("Unsupported language: fortran"));
    }
}
