package com.apex.judge.service;

import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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

    public ExecutionResult execute(String language, String code, String input, int timeLimitMs, int memoryLimitMb) {
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
                    // In container sandbox, compile and run
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

            // Feed STDIN
            if (input != null) {
                try (OutputStream os = process.getOutputStream()) {
                    os.write(input.getBytes(StandardCharsets.UTF_8));
                    os.flush();
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
            result.stdout = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            result.stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);
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
