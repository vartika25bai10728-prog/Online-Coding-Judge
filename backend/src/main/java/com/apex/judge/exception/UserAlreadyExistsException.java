package com.apex.judge.exception;

/**
 * Thrown during registration when an account already exists with the requested username or email.
 */
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
