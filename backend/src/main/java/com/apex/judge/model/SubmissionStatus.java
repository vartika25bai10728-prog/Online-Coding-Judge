package com.apex.judge.model;

public enum SubmissionStatus {
    QUEUED,
    COMPILING,
    RUNNING,
    JUDGING,
    COMPLETED;

    public static SubmissionStatus fromString(String value) {
        if (value == null) return QUEUED;
        for (SubmissionStatus s : values()) {
            if (s.name().equalsIgnoreCase(value.trim())) {
                return s;
            }
        }
        return QUEUED;
    }
}
