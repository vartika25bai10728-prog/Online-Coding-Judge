package com.apex.judge.service.executor;

import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

/**
 * Concrete executor for Java source code.
 * Demonstrates:
 * - Inheritance (extends BaseCodeExecutor)
 * - Method overriding (@Override createProcessBuilder)
 * - Super constructor invocation (super("java"))
 * - Multi-stage compilation & execution
 */
@Component
public class JavaCodeExecutor extends BaseCodeExecutor {

    public JavaCodeExecutor() {
        super("java");
    }

    @Override
    protected ProcessBuilder createProcessBuilder(Path workDir, String code, int memoryLimitMb) throws Exception {
        File sourceFile = new File(workDir.toFile(), "Solution.java");
        Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);

        // Compile Java source code
        ProcessBuilder compilePb = new ProcessBuilder("javac", "-encoding", "UTF-8", sourceFile.getAbsolutePath());
        compilePb.directory(workDir.toFile());
        Process compileProcess = compilePb.start();

        boolean compiled = compileProcess.waitFor(10000, TimeUnit.MILLISECONDS);
        if (!compiled || compileProcess.exitValue() != 0) {
            String compileError = readStream(compileProcess.getErrorStream());
            throw new RuntimeException("Compilation Error:\n" + compileError);
        }

        // Return execution ProcessBuilder with memory constraints
        ProcessBuilder runPb = new ProcessBuilder(
                "java",
                "-Xmx" + memoryLimitMb + "m",
                "-Xms16m",
                "-Dfile.encoding=UTF-8",
                "-cp", workDir.toAbsolutePath().toString(),
                "Solution"
        );
        runPb.directory(workDir.toFile());
        return runPb;
    }
}
