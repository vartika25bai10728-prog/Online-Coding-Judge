package com.apex.judge.model;

public enum Difficulty {
    EASY("Easy", 100),
    MEDIUM("Medium", 200),
    HARD("Hard", 300);

    private final String displayName;
    private final int basePoints;

    Difficulty(String displayName, int basePoints) {
        this.displayName = displayName;
        this.basePoints = basePoints;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getBasePoints() {
        return basePoints;
    }

    public static Difficulty fromString(String value) {
        if (value == null) return null;
        for (Difficulty d : values()) {
            if (d.name().equalsIgnoreCase(value.trim()) || d.displayName.equalsIgnoreCase(value.trim())) {
                return d;
            }
        }
        return null;
    }
}
