package com.apex.judge.controller;

import com.apex.judge.exception.InvalidSubmissionException;
import com.apex.judge.exception.ResourceNotFoundException;
import com.apex.judge.model.Difficulty;
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
        Difficulty diff = (difficulty != null && !difficulty.equalsIgnoreCase("ALL"))
                ? Difficulty.fromString(difficulty)
                : null;
        String query = (search != null && !search.isBlank()) ? search.trim() : null;

        // Uses the explicit JPQL @Query defined in ProblemRepository
        List<Problem> problems = problemRepository.searchProblems(diff, query);

        return ResponseEntity.ok(Map.of(
                "problems", problems,
                "total", problems.size()
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getProblemBySlug(@PathVariable String slug) {
        return problemRepository.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Problem", "slug", slug));
    }

    @PostMapping
    public ResponseEntity<?> createProblem(@RequestBody Problem problem) {
        if (problem.getTitle() == null || problem.getTitle().isBlank()) {
            throw new InvalidSubmissionException("Problem title cannot be empty");
        }
        if (problem.getSlug() == null || problem.getSlug().isBlank()) {
            throw new InvalidSubmissionException("Problem slug cannot be empty");
        }
        Problem saved = problemRepository.save(problem);
        return ResponseEntity.ok(saved);
    }
}
