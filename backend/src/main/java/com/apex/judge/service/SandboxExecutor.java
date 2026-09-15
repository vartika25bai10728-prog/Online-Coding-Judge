package com.apex.judge.service;

import com.apex.judge.service.executor.CodeExecutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class SandboxExecutor {

    public static class ExecutionResult {
        public boolean timedOut;
        public int exitCode;
        public String stdout;
        public String stderr;
        public long durationMs;
        public long memoryMb;
    }

    private final List<CodeExecutor> codeExecutors;

    @Autowired
    public SandboxExecutor(List<CodeExecutor> codeExecutors) {
        this.codeExecutors = codeExecutors != null ? codeExecutors : new ArrayList<>();
    }

    public SandboxExecutor() {
        this.codeExecutors = new ArrayList<>();
    }

    /**
     * Overloaded execute method with default limits (2000ms time limit, 256MB memory limit).
     */
    public ExecutionResult execute(String language, String code, String input) {
        return execute(language, code, input, 2000, 256);
    }

    /**
     * Primary execution method managing process lifecycles, stream I/O via Reader/Writer,
     * and isolated process timeouts.
     */
    public ExecutionResult execute(String language, String code, String input, int timeLimitMs, int memoryLimitMb) {
        // First check polymorphic CodeExecutor implementations
        if (language != null && !codeExecutors.isEmpty()) {
            for (CodeExecutor executor : codeExecutors) {
                if (executor.supportsLanguage(language)) {
                    return executor.execute(code, input, timeLimitMs, memoryLimitMb);
                }
            }
        }

        ExecutionResult result = new ExecutionResult();
        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("judge_exec_");
            long startTime = System.currentTimeMillis();

            ProcessBuilder pb;
            File sourceFile;

            switch (language.toLowerCase()) {
                case "python":
                    sourceFile = new File(tempDir.toFile(), "solution.py");
                    Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);
                    pb = new ProcessBuilder("python3", "-I", sourceFile.getAbsolutePath());
                    break;

                case "javascript":
                case "js":
                    sourceFile = new File(tempDir.toFile(), "solution.js");
                    Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);
                    pb = new ProcessBuilder("node", "--max-old-space-size=" + memoryLimitMb, sourceFile.getAbsolutePath());
                    break;

                case "java":
                    sourceFile = new File(tempDir.toFile(), "Solution.java");
                    Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);
                    pb = new ProcessBuilder("java", sourceFile.getAbsolutePath());
                    break;

                case "cpp":
                    sourceFile = new File(tempDir.toFile(), "solution.cpp");
                    File binFile = new File(tempDir.toFile(), "solution.out");
                    Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);
                    Process compileProc = new ProcessBuilder("g++", "-O2", sourceFile.getAbsolutePath(), "-o", binFile.getAbsolutePath()).start();
                    compileProc.waitFor(5000, TimeUnit.MILLISECONDS);
                    pb = new ProcessBuilder(binFile.getAbsolutePath());
                    break;

                default:
                    result.stderr = "Unsupported language: " + language;
                    result.exitCode = 1;
                    return result;
            }

            pb.directory(tempDir.toFile());
            Process process = pb.start();

            // Feed STDIN using BufferedWriter & OutputStreamWriter (Character Stream Writer)
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8))) {
                    writer.write(input);
                    writer.flush();
                }
            }

            boolean finished = process.waitFor(timeLimitMs + 500, TimeUnit.MILLISECONDS);
            long endTime = System.currentTimeMillis();
            result.durationMs = endTime - startTime;

            if (!finished) {
                process.destroyForcibly();
                result.timedOut = true;
                result.exitCode = 124;
                result.stderr = "Time Limit Exceeded (" + timeLimitMs + " ms)";
                return result;
            }

            result.exitCode = process.exitValue();

            // Read STDOUT and STDERR using BufferedReader & InputStreamReader (Character Stream Reader)
            result.stdout = readCharacterStream(process.getInputStream());
            result.stderr = readCharacterStream(process.getErrorStream());
            result.memoryMb = 32; // Baseline execution estimate

        } catch (Exception e) {
            result.exitCode = 1;
            result.stderr = e.getMessage();
        } finally {
            if (tempDir != null) {
                try {
                    deleteDirectory(tempDir.toFile());
                } catch (Exception ignored) {}
            }
        }

        return result;
    }

    /**
     * Reads process character stream using BufferedReader with a standard while loop.
     */
    private String readCharacterStream(InputStream inputStream) throws IOException {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!builder.isEmpty()) {
                    builder.append("\n");
                }
                builder.append(line);
            }
        }
        return builder.toString();
    }

    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) deleteDirectory(f);
                else f.delete();
            }
        }
        dir.delete();
    }
}
