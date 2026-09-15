package com.apex.judge.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EnumModelTest {

    @Test
    @DisplayName("Difficulty enum should have correct display names, points, and parsing")
    void testDifficultyEnum() {
        assertEquals("Easy", Difficulty.EASY.getDisplayName());
        assertEquals(100, Difficulty.EASY.getBasePoints());
        assertEquals(200, Difficulty.MEDIUM.getBasePoints());
        assertEquals(300, Difficulty.HARD.getBasePoints());

        assertEquals(Difficulty.EASY, Difficulty.fromString("EASY"));
        assertEquals(Difficulty.EASY, Difficulty.fromString("easy"));
        assertEquals(Difficulty.MEDIUM, Difficulty.fromString("Medium"));
        assertNull(Difficulty.fromString("UNKNOWN"));
        assertNull(Difficulty.fromString(null));
    }

    @Test
    @DisplayName("Verdict enum should have descriptions and terminal state flags")
    void testVerdictEnum() {
        assertFalse(Verdict.PENDING.isTerminal());
        assertTrue(Verdict.ACCEPTED.isTerminal());
        assertTrue(Verdict.WRONG_ANSWER.isTerminal());
        assertTrue(Verdict.TIME_LIMIT_EXCEEDED.isTerminal());

        assertEquals(Verdict.ACCEPTED, Verdict.fromString("ACCEPTED"));
        assertEquals(Verdict.ACCEPTED, Verdict.fromString("accepted"));
        assertEquals(Verdict.PENDING, Verdict.fromString(null));
    }
}
