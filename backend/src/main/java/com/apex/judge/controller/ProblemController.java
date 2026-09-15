package com.apex.judge.controller;

import com.apex.judge.model.Problem;
import com.apex.judge.repository.ProblemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin(origins = "*")
public class ProblemController {

    private final ProblemRepository problemRepository;

    public ProblemController(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    @GetMapping
    public ResponseEntity<?> getProblems(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search
    ) {
        List<Problem> problems = problemRepository.findAll();
        // In-memory or query filters
        if (difficulty != null && !difficulty.equalsIgnoreCase("ALL")) {
            problems = problems.stream()
                    .filter(p -> p.getDifficulty().equalsIgnoreCase(difficulty))
                    .toList();
        }
        if (search != null && !search.isBlank()) {
            String query = search.toLowerCase();
            problems = problems.stream()
                    .filter(p -> p.getTitle().toLowerCase().contains(query) || p.getTags().toLowerCase().contains(query))
                    .toList();
        }

        return ResponseEntity.ok(Map.of(
                "problems", problems,
                "total", problems.size()
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getProblemBySlug(@PathVariable String slug) {
        return problemRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProblem(@RequestBody Problem problem) {
        Problem saved = problemRepository.save(problem);
        return ResponseEntity.ok(saved);
    }
}
