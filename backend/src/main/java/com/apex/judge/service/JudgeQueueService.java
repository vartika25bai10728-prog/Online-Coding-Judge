package com.apex.judge.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class JudgeQueueService {

    private static final String SUBMISSION_QUEUE_KEY = "apex:queue:submissions";
    private final StringRedisTemplate redisTemplate;

    public JudgeQueueService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Push submission ID onto the Redis FIFO queue
     */
    public void enqueueSubmission(String submissionId) {
        redisTemplate.opsForList().rightPush(SUBMISSION_QUEUE_KEY, submissionId);
    }

    /**
     * Pop next submission ID with blocking timeout
     */
    public String dequeueSubmission(Duration timeout) {
        return redisTemplate.opsForList().leftPop(SUBMISSION_QUEUE_KEY, timeout);
    }

    public Long getQueueSize() {
        return redisTemplate.opsForList().size(SUBMISSION_QUEUE_KEY);
    }
}
