package com.apex.judge.repository;

import com.apex.judge.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Submission> findByProblemIdOrderByCreatedAtDesc(String problemId);
    List<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(String userId, String problemId);
    List<Submission> findAllByOrderByCreatedAtDesc();
}
