package com.apex.judge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class ApexJudgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApexJudgeApplication.class, args);
    }
}
