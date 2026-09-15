package com.apex.judge.service.executor;

import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Concrete executor for JavaScript / Node source code.
 */
@Component
public class JsCodeExecutor extends BaseCodeExecutor {

    public JsCodeExecutor() {
        super("javascript");
    }

    @Override
    public boolean supportsLanguage(String language) {
        if (language == null) return false;
        String trimmed = language.trim().toLowerCase();
        return "javascript".equals(trimmed) || "js".equals(trimmed) || "node".equals(trimmed);
    }

    @Override
    protected ProcessBuilder createProcessBuilder(Path workDir, String code, int memoryLimitMb) throws Exception {
        File sourceFile = new File(workDir.toFile(), "solution.js");
        Files.writeString(sourceFile.toPath(), code, StandardCharsets.UTF_8);

        ProcessBuilder pb = new ProcessBuilder("node", "--max-old-space-size=" + memoryLimitMb, sourceFile.getAbsolutePath());
        pb.directory(workDir.toFile());
        return pb;
    }
}
