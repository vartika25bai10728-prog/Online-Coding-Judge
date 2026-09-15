package com.apex.judge.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    private String id;

    @Column(unique = true, nullable = false, length = 100)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Column(nullable = false)
    private String tags; // Comma separated

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String inputFormat;

    @Column(columnDefinition = "TEXT")
    private String outputFormat;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    private Integer timeLimitMs = 2000;
    private Integer memoryLimitMb = 256;
    private Double acceptanceRate = 0.0;
    private Integer totalSubmissions = 0;
    private Integer totalAccepted = 0;

    @Column(columnDefinition = "TEXT")
    private String starterPython;

    @Column(columnDefinition = "TEXT")
    private String starterJavascript;

    @Column(columnDefinition = "TEXT")
    private String starterJava;

    @Column(columnDefinition = "TEXT")
    private String starterCpp;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TestCase> testCases = new ArrayList<>();

    private Instant createdAt = Instant.now();

    public Problem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public Integer getTimeLimitMs() { return timeLimitMs; }
    public void setTimeLimitMs(Integer timeLimitMs) { this.timeLimitMs = timeLimitMs; }

    public Integer getMemoryLimitMb() { return memoryLimitMb; }
    public void setMemoryLimitMb(Integer memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }

    public Double getAcceptanceRate() { return acceptanceRate; }
    public void setAcceptanceRate(Double acceptanceRate) { this.acceptanceRate = acceptanceRate; }

    public Integer getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(Integer totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public Integer getTotalAccepted() { return totalAccepted; }
    public void setTotalAccepted(Integer totalAccepted) { this.totalAccepted = totalAccepted; }

    public String getStarterPython() { return starterPython; }
    public void setStarterPython(String starterPython) { this.starterPython = starterPython; }

    public String getStarterJavascript() { return starterJavascript; }
    public void setStarterJavascript(String starterJavascript) { this.starterJavascript = starterJavascript; }

    public String getStarterJava() { return starterJava; }
    public void setStarterJava(String starterJava) { this.starterJava = starterJava; }

    public String getStarterCpp() { return starterCpp; }
    public void setStarterCpp(String starterCpp) { this.starterCpp = starterCpp; }

    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
