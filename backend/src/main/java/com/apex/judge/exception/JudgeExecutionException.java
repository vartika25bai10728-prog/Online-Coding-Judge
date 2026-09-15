package com.apex.judge.exception;

/**
 * Thrown when an unrecoverable sandbox fault or system-level process execution error occurs.
 * Demonstrates Checked/Unchecked Exception Design in Java.
 */
public class JudgeExecutionException extends RuntimeException {

    private final String stage;

    public JudgeExecutionException(String message, String stage) {
        super(message);
        this.stage = stage;
    }

    public JudgeExecutionException(String message, String stage, Throwable cause) {
        super(message, cause);
        this.stage = stage;
    }

    public String getStage() {
        return stage;
    }
}
