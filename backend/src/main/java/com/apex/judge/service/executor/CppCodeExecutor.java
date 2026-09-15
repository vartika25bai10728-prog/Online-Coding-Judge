package com.apex.judge.service.executor;

import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Concrete executor for C++ source code.
 */
@Component
public class CppCodeExecutor extends BaseCodeExecutor {

    public CppCodeExecutor() {
        super("cpp");
    }

    @Override
    protected ProcessBuilder createProcessBuilder(Path workDir, String code, int memoryLimitMb) throws Exception {
        File sourceFile = new File(workDir.toFile(), "solution.cpp");
        File binFile = new File(workDir.toFile(), "solution.out");
        Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);

        ProcessBuilder compilePb = new ProcessBuilder("g++", "-O2", "-std=c++17", sourceFile.getAbsolutePath(), "-o", binFile.getAbsolutePath());
        compilePb.directory(workDir.toFile());
        Process compileProcess = compilePb.start();

        boolean compiled = compileProcess.waitFor(10000, TimeUnit.MILLISECONDS);
        if (!compiled || compileProcess.exitValue() != 0) {
            String compileError = readStream(compileProcess.getErrorStream());
            throw new RuntimeException("C++ Compilation Error:\n" + compileError);
        }

        ProcessBuilder runPb = new ProcessBuilder(binFile.getAbsolutePath());
        runPb.directory(workDir.toFile());
        return runPb;
    }
}
