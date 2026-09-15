package com.apex.judge.exception;

/**
 * Thrown when a requested coding challenge is absent by slug or ID.
 * Demonstrates Custom Exceptions and Exception Inheritance.
 */
public class ProblemNotFoundException extends ResourceNotFoundException {

    public ProblemNotFoundException(String identifier) {
        super("Problem", "id/slug", identifier);
    }
}
