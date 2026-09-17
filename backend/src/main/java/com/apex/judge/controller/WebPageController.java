package com.apex.judge.controller;

import com.apex.judge.exception.InvalidSubmissionException;
import com.apex.judge.exception.ProblemNotFoundException;
import com.apex.judge.model.*;
import com.apex.judge.repository.ProblemRepository;
import com.apex.judge.repository.SubmissionRepository;
import com.apex.judge.repository.SystemStatsJdbcRepository;
import com.apex.judge.repository.UserRepository;
import com.apex.judge.service.JudgeQueueService;
import com.apex.judge.service.JudgeWorkerService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Spring MVC Web Controller providing server-side rendered Thymeleaf views.
 * Demonstrates:
 * - Spring MVC routing (@GetMapping, @PostMapping, @PathVariable, @RequestParam)
 * - Model attributes injection and dynamic view rendering
 * - Security principal resolution and session integration
 * - Explicit JPQL queries and direct JDBC operations invocation
 */
@Controller
public class WebPageController {

    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final SystemStatsJdbcRepository statsJdbcRepository;
    private final JudgeQueueService judgeQueueService;
    private final JudgeWorkerService judgeWorkerService;
    private final PasswordEncoder passwordEncoder;

    public WebPageController(
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository,
            UserRepository userRepository,
            SystemStatsJdbcRepository statsJdbcRepository,
            JudgeQueueService judgeQueueService,
            JudgeWorkerService judgeWorkerService,
            PasswordEncoder passwordEncoder
    ) {
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.statsJdbcRepository = statsJdbcRepository;
        this.judgeQueueService = judgeQueueService;
        this.judgeWorkerService = judgeWorkerService;
        this.passwordEncoder = passwordEncoder;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return null;
        }
        return userRepository.findByUsername(principal.getName())
                .or(() -> userRepository.findByEmail(principal.getName()))
                .orElse(null);
    }

    @GetMapping("/")
    public String index() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        model.addAttribute("currentUser", currentUser);

        // Fetch direct JDBC aggregated platform statistics
        try {
            SystemStatsJdbcRepository.PlatformStatistics stats = statsJdbcRepository.fetchAggregatedStatistics();
            model.addAttribute("platformStats", stats);
        } catch (Exception e) {
            model.addAttribute("statsError", "Statistics telemetry initializing...");
        }

        List<Problem> problems = problemRepository.findAll();
        model.addAttribute("problems", problems);

        List<Submission> recentSubmissions = submissionRepository.findAllByOrderByCreatedAtDesc();
        if (recentSubmissions.size() > 8) {
            recentSubmissions = recentSubmissions.subList(0, 8);
        }
        model.addAttribute("recentSubmissions", recentSubmissions);

        return "dashboard";
    }

    @GetMapping("/problems")
    public String problems(
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search,
            Model model,
            Principal principal
    ) {
        model.addAttribute("currentUser", getAuthenticatedUser(principal));

        Difficulty diffEnum = null;
        if (difficulty != null && !difficulty.isBlank() && !difficulty.equalsIgnoreCase("ALL")) {
            try {
                diffEnum = Difficulty.valueOf(difficulty.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String searchQuery = (search != null && !search.isBlank()) ? search.trim() : null;
        List<Problem> problemList = problemRepository.searchProblems(diffEnum, searchQuery);

        model.addAttribute("problems", problemList);
        model.addAttribute("selectedDifficulty", difficulty != null ? difficulty : "ALL");
        model.addAttribute("searchQuery", searchQuery);
        model.addAttribute("difficulties", Difficulty.values());

        return "problems";
    }

    @GetMapping("/problems/{slug}")
    public String problemDetail(@PathVariable String slug, Model model, Principal principal) {
        User currentUser = getAuthenticatedUser(principal);
        model.addAttribute("currentUser", currentUser);

        Problem problem = problemRepository.findBySlug(slug)
                .or(() -> problemRepository.findById(slug))
                .orElseThrow(() -> new ProblemNotFoundException(slug));

        model.addAttribute("problem", problem);
        model.addAttribute("testCases", problem.getTestCases());
        model.addAttribute("languages", List.of("java", "python", "cpp", "javascript"));

        // Fastest accepted solutions using explicit JPQL
        List<Submission> fastest = submissionRepository.findFastestSubmissionsForProblem(problem.getId(), Verdict.ACCEPTED);
        if (fastest.size() > 5) {
            fastest = fastest.subList(0, 5);
        }
        model.addAttribute("fastestSubmissions", fastest);

        // User's past submissions for this problem
        if (currentUser != null) {
            List<Submission> userSubmissions = submissionRepository
                    .findByUserIdAndProblemIdOrderByCreatedAtDesc(currentUser.getId(), problem.getId());
            model.addAttribute("userSubmissions", userSubmissions);
        }

        return "problem";
    }

    @PostMapping("/problems/{slug}/submit")
    public String submitCode(
            @PathVariable String slug,
            @RequestParam String language,
            @RequestParam String code,
            Principal principal,
            RedirectAttributes redirectAttributes
    ) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            // Default to demo/guest user if unauthenticated
            user = userRepository.findByUsername("guest")
                    .orElseGet(() -> userRepository.save(new User(
                            UUID.randomUUID().toString(),
                            "guest",
                            "guest@apexjudge.io",
                            passwordEncoder.encode("guest123"),
                            "USER"
                    )));
        }

        Problem problem = problemRepository.findBySlug(slug)
                .or(() -> problemRepository.findById(slug))
                .orElseThrow(() -> new ProblemNotFoundException(slug));

        if (code == null || code.trim().isEmpty()) {
            throw new InvalidSubmissionException("Code submission cannot be empty or whitespace only");
        }

        if (language == null || language.trim().isEmpty()) {
            throw new InvalidSubmissionException("Programming language must be specified");
        }

        Submission submission = new Submission(
                UUID.randomUUID().toString(),
                user,
                problem,
                language.trim().toLowerCase(),
                code,
                SubmissionStatus.QUEUED
        );

        submissionRepository.save(submission);

        // Enqueue submission in Redis (with fallback for standalone runtime)
        try {
            judgeQueueService.enqueueSubmission(submission.getId());
        } catch (Exception ignored) {
            // Queue polling will be bypassed by immediate worker execution below
        }

        // Immediately evaluate in worker to provide synchronous feedback for user review
        try {
            judgeWorkerService.judgeSubmission(submission.getId());
        } catch (Exception e) {
            // Evaluated asynchronously if worker is busy
        }

        redirectAttributes.addFlashAttribute("successMessage", "Code submitted successfully for evaluation!");
        return "redirect:/submissions/" + submission.getId();
    }

    @GetMapping("/submissions")
    public String submissions(Model model, Principal principal) {
        model.addAttribute("currentUser", getAuthenticatedUser(principal));
        List<Submission> allSubmissions = submissionRepository.findAllByOrderByCreatedAtDesc();
        model.addAttribute("submissions", allSubmissions);
        return "submissions";
    }

    @GetMapping("/submissions/{id}")
    public String submissionDetail(@PathVariable String id, Model model, Principal principal) {
        model.addAttribute("currentUser", getAuthenticatedUser(principal));
        Submission submission = submissionRepository.findById(id).orElse(null);
        if (submission == null) {
            return "redirect:/submissions";
        }
        model.addAttribute("submission", submission);
        return "submission-detail";
    }

    @GetMapping("/leaderboard")
    public String leaderboard(Model model, Principal principal) {
        model.addAttribute("currentUser", getAuthenticatedUser(principal));
        List<User> topUsers = userRepository.findAllByOrderByRatingDesc();
        model.addAttribute("topUsers", topUsers);
        return "leaderboard";
    }

    @GetMapping("/profile")
    public String profile(Model model, Principal principal) {
        User user = getAuthenticatedUser(principal);
        if (user == null) {
            return "redirect:/login";
        }

        model.addAttribute("currentUser", user);

        // Use explicit JPQL query to retrieve user's accepted submissions
        List<Submission> acceptedSubmissions = submissionRepository.findAcceptedSubmissionsByUser(user.getId());
        model.addAttribute("acceptedSubmissions", acceptedSubmissions);

        List<Submission> allUserSubmissions = submissionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        model.addAttribute("allSubmissions", allUserSubmissions);

        return "profile";
    }

    @GetMapping("/login")
    public String loginPage(
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String logout,
            @RequestParam(required = false) String registered,
            Model model,
            Principal principal
    ) {
        if (principal != null) {
            return "redirect:/dashboard";
        }
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid username or password. Please check your credentials.");
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "You have been logged out securely.");
        }
        if (registered != null) {
            model.addAttribute("registeredMessage", "Account created successfully! Please log in.");
        }
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(Model model, Principal principal) {
        if (principal != null) {
            return "redirect:/dashboard";
        }
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            Model model
    ) {
        if (username == null || username.trim().length() < 3) {
            model.addAttribute("error", "Username must be at least 3 characters long.");
            return "register";
        }
        if (email == null || !email.contains("@")) {
            model.addAttribute("error", "Please provide a valid email address.");
            return "register";
        }
        if (password == null || password.length() < 6) {
            model.addAttribute("error", "Password must be at least 6 characters long.");
            return "register";
        }

        if (userRepository.existsByUsername(username.trim())) {
            model.addAttribute("error", "Username is already taken.");
            return "register";
        }
        if (userRepository.existsByEmail(email.trim())) {
            model.addAttribute("error", "Email is already registered.");
            return "register";
        }

        User newUser = new User(
                UUID.randomUUID().toString(),
                username.trim(),
                email.trim(),
                passwordEncoder.encode(password),
                "USER"
        );
        userRepository.save(newUser);

        return "redirect:/login?registered=true";
    }
}
