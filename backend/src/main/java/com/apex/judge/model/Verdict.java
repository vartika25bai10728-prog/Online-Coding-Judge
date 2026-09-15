package com.apex.judge.model;

public enum Verdict {
    PENDING("Pending Evaluation", false),
    ACCEPTED("Accepted", true),
    WRONG_ANSWER("Wrong Answer", true),
    TIME_LIMIT_EXCEEDED("Time Limit Exceeded", true),
    MEMORY_LIMIT_EXCEEDED("Memory Limit Exceeded", true),
    RUNTIME_ERROR("Runtime Error", true),
    COMPILATION_ERROR("Compilation Error", true);

    private final String description;
    private final boolean terminal;

    Verdict(String description, boolean terminal) {
        this.description = description;
        this.terminal = terminal;
    }

    public String getDescription() {
        return description;
    }

    public boolean isTerminal() {
        return terminal;
    }

    public static Verdict fromString(String value) {
        if (value == null) return PENDING;
        for (Verdict v : values()) {
            if (v.name().equalsIgnoreCase(value.trim())) {
                return v;
            }
        }
        return PENDING;
    }
}
