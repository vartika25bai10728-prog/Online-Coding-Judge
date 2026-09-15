package com.apex.judge.service.executor;

import com.apex.judge.service.SandboxExecutor.ExecutionResult;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Abstract base class providing template execution patterns and common process/stream I/O utilities.
 * Demonstrates:
 * - Abstract classes and abstract methods
 * - Method Overriding and Method Overloading
 * - Template Method design pattern
 * - Character stream handling (BufferedReader, BufferedWriter)
 * - Process isolation and resource cleanup using try-finally
 */
public abstract class BaseCodeExecutor implements CodeExecutor {

    protected static final int DEFAULT_TIMEOUT_MS = 2000;
    protected static final int DEFAULT_MEMORY_MB = 256;

    private final String languageIdentifier;

    /**
     * Parameterized constructor using 'this' keyword to initialize language identity.
     */
    protected BaseCodeExecutor(String languageIdentifier) {
        this.languageIdentifier = languageIdentifier;
    }

    public String getLanguageIdentifier() {
        return this.languageIdentifier;
    }

    @Override
    public boolean supportsLanguage(String language) {
        if (language == null) {
            return false;
        }
        return this.languageIdentifier.equalsIgnoreCase(language.trim());
    }

    /**
     * Overloaded method demonstrating polymorphic fallback to default execution limits.
     */
    @Override
    public ExecutionResult execute(String code, String input) {
        return this.execute(code, input, DEFAULT_TIMEOUT_MS, DEFAULT_MEMORY_MB);
    }

    /**
     * Template method coordinating temporary directory creation, code compilation/setup,
     * child process execution, character stream piping, and guaranteed filesystem teardown.
     */
    @Override
    public ExecutionResult execute(String code, String input, int timeLimitMs, int memoryLimitMb) {
        ExecutionResult result = new ExecutionResult();
        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("judge_" + this.languageIdentifier + "_");
            long startTime = System.currentTimeMillis();

            // Delegate language-specific compilation or process configuration to subclass
            ProcessBuilder pb = createProcessBuilder(tempDir, code, memoryLimitMb);
            if (pb == null) {
                result.exitCode = 1;
                result.stderr = "Failed to construct execution process for " + this.languageIdentifier;
                return result;
            }

            Process process = pb.start();

            // Pipe input through BufferedWriter character stream
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(
                        new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
                    writer.write(input);
                    writer.flush();
                } catch (IOException ignored) {
                    // Process may terminate before consuming full input
                }
            } else {
                process.getOutputStream().close();
            }

            // Await execution with strict timeout
            boolean finished = process.waitFor(timeLimitMs, TimeUnit.MILLISECONDS);
            long duration = System.currentTimeMillis() - startTime;
            result.durationMs = duration;

            if (!finished) {
                process.destroyForcibly();
                result.timedOut = true;
                result.exitCode = 124;
                result.stderr = "Time Limit Exceeded (" + timeLimitMs + "ms)";
                return result;
            }

            result.exitCode = process.exitValue();
            result.stdout = readStream(process.getInputStream());
            result.stderr = readStream(process.getErrorStream());

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            result.exitCode = 130;
            result.stderr = "Execution interrupted by judge system";
        } catch (Exception e) {
            result.exitCode = 1;
            result.stderr = "Execution Exception: " + e.getMessage();
        } finally {
            cleanupTempDir(tempDir);
        }

        return result;
    }

    /**
     * Abstract factory method implemented by language-specific subclasses.
     */
    protected abstract ProcessBuilder createProcessBuilder(Path workDir, String code, int memoryLimitMb) throws Exception;

    /**
     * Helper reading character streams line-by-line using BufferedReader and while loop.
     */
    protected String readStream(InputStream inputStream) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            boolean first = true;
            while ((line = reader.readLine()) != null) {
                if (!first) {
                    sb.append("\n");
                }
                sb.append(line);
                first = false;
            }
        }
        return sb.toString();
    }

    /**
     * Cleans up temporary sandbox workspace files.
     */
    private void cleanupTempDir(Path dir) {
        if (dir != null && Files.exists(dir)) {
            try {
                Files.walk(dir)
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(p -> {
                            try {
                                Files.deleteIfExists(p);
                            } catch (IOException ignored) {}
                        });
            } catch (IOException ignored) {}
        }
    }
}
