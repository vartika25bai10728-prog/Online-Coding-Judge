package com.apex.judge.repository;

import com.apex.judge.model.Difficulty;
import com.apex.judge.model.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, String> {
    Optional<Problem> findBySlug(String slug);
    List<Problem> findByDifficulty(Difficulty difficulty);

    @Query("SELECT p FROM Problem p WHERE (:difficulty IS NULL OR p.difficulty = :difficulty) AND " +
           "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Problem> searchProblems(@Param("difficulty") Difficulty difficulty, @Param("search") String search);
}
