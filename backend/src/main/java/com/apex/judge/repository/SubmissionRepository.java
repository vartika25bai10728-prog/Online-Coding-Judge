package com.apex.judge.repository;

import com.apex.judge.model.Submission;
import com.apex.judge.model.Verdict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {
    List<Submission> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Submission> findByProblemIdOrderByCreatedAtDesc(String problemId);
    List<Submission> findByUserIdAndProblemIdOrderByCreatedAtDesc(String userId, String problemId);
    List<Submission> findAllByOrderByCreatedAtDesc();

    @Query("SELECT s FROM Submission s WHERE s.user.id = :userId AND s.verdict = com.apex.judge.model.Verdict.ACCEPTED ORDER BY s.createdAt DESC")
    List<Submission> findAcceptedSubmissionsByUser(@Param("userId") String userId);

    @Query("SELECT s FROM Submission s WHERE s.problem.id = :problemId AND s.verdict = :verdict ORDER BY s.runtimeMs ASC")
    List<Submission> findFastestSubmissionsForProblem(@Param("problemId") String problemId, @Param("verdict") Verdict verdict);
}
