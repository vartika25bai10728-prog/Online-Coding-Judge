package com.apex.judge.exception;

public class InvalidSubmissionException extends RuntimeException {

    private final String reason;

    public InvalidSubmissionException(String message) {
        super(message);
        this.reason = message;
    }

    public InvalidSubmissionException(String message, Throwable cause) {
        super(message, cause);
        this.reason = message;
    }

    public String getReason() {
        return reason;
    }
}
