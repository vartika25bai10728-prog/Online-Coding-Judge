package com.apex.judge.service.executor;

import com.apex.judge.service.SandboxExecutor.ExecutionResult;

/**
 * Interface defining the contract for programming language code execution.
 * Demonstrates Java Interfaces, Polymorphism, and Contract-driven OOP design.
 */
public interface CodeExecutor {

    /**
     * Determines whether this executor supports the given programming language.
     *
     * @param language the language name (e.g. "java", "python", "cpp")
     * @return true if supported, false otherwise
     */
    boolean supportsLanguage(String language);

    /**
     * Overloaded execution method using default sandbox resource constraints.
     */
    ExecutionResult execute(String code, String input);

    /**
     * Primary execution method enforcing explicit time and memory quotas.
     *
     * @param code           the raw source code string
     * @param input          standard input supplied to the program
     * @param timeLimitMs    maximum permissible execution duration in milliseconds
     * @param memoryLimitMb  maximum permissible resident set memory in megabytes
     * @return ExecutionResult containing exit codes, duration, and captured standard streams
     */
    ExecutionResult execute(String code, String input, int timeLimitMs, int memoryLimitMb);
}
