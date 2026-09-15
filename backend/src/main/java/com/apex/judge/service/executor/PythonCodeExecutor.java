package com.apex.judge.service.executor;

import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Concrete executor for Python source code.
 */
@Component
public class PythonCodeExecutor extends BaseCodeExecutor {

    public PythonCodeExecutor() {
        super("python");
    }

    @Override
    protected ProcessBuilder createProcessBuilder(Path workDir, String code, int memoryLimitMb) throws Exception {
        File sourceFile = new File(workDir.toFile(), "solution.py");
        Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);

        ProcessBuilder pb = new ProcessBuilder("python3", "-I", sourceFile.getAbsolutePath());
        pb.directory(workDir.toFile());
        return pb;
    }
}
