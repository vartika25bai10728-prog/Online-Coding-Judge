# Apex Online Coding Judge

A production-grade Online Coding Judge built with a modern React frontend and a full-scale **Java 21 + Spring Boot 3** backend architecture.

---

## 🏛️ Architecture Overview

The system follows an asynchronous, distributed judge architecture:

```
[React + Monaco IDE] 
       │
       ▼ (REST / JWT)
[Spring Boot 3 REST API] (Java 21)
       │
       ▼ (RPUSH)
[Redis Submission Queue]
       │
       ▼ (BLPOP / Worker Daemon)
[Judge Worker Engine] (Sandbox Isolation)
       │
       ├── Compiles & executes in Docker cgroups sandbox (Java, Python, JS, C++)
       ├── Normalizes whitespace, carriage returns & JSON tokens
       └── Evaluates public & hidden test cases
       │
       ▼ (JPA / Hibernate)
[PostgreSQL Database] (Flyway Versioned Schema)
       │
       ▼ (WebSocket STOMP / SSE)
[Real-Time Client Verdict Notification]
```

---

## ☕ Java 21 + Spring Boot 3 Backend (`/backend`)

The backend is fully written in **Java 21** utilizing **Spring Boot 3.3.0**:

- **Framework**: Spring Boot 3.3 (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-data-redis`, `spring-boot-starter-websocket`)
- **Language**: Java 21 LTS (Virtual Threads, Records, Pattern Matching)
- **Security**: Spring Security + Stateless JWT filter (`io.jsonwebtoken:jjwt-api:0.12.5`) with BCrypt password hashing and role-based authorization (`USER` vs `ADMIN`)
- **Persistence**: Spring Data JPA with Hibernate and Flyway migrations (`/backend/src/main/resources/db/migration/V1__init_schema.sql`)
- **Queue**: Redis FIFO queue (`opsForList().rightPush` & `opsForList().leftPop`) for asynchronous job dispatch
- **Sandbox Worker**: `JudgeWorkerService` with isolated subprocess execution, memory constraints, and time limits
- **WebSockets**: STOMP over SockJS (`/ws`) broadcasting to `/topic/submissions/{id}`

### Running the Java Stack with Docker Compose

To start PostgreSQL, Redis, and the Java 21 Spring Boot Backend in a single command:

```bash
docker compose up --build
```

Services started:
- **PostgreSQL 16**: Port `5432` (Database: `apex_judge_db`, User: `apex_user`)
- **Redis 7**: Port `6379`
- **Spring Boot 3 API**: Port `8080`

### Building the Java Backend with Maven

```bash
cd backend
mvn clean package
java -jar target/apex-judge-backend-1.0.0.jar
```

---

## 💻 Frontend (`/src`)

- **Framework**: React 18 + TypeScript + Vite + Tailwind CSS
- **Code Editor**: Monaco Code Editor (VS Code engine) with full multi-language syntax highlighting, auto-completion, line numbers, and keyboard shortcuts
- **Default Language**: Java 21 (with Python, JavaScript, and C++ options)
- **Interactive Console**: Split-pane test cases with custom input authoring, diff inspector, and real-time execution feedback
- **Competitive Contests**: ICPC penalty scoring, problem sets with points, live countdown timer, and dynamic scoreboard
- **Global Leaderboard & Profiles**: Elo rating tiers, 60-day contribution heatmap, solved difficulty distribution, and earned badges
- **Admin Console**: Problem authoring with public and hidden test cases, difficulty selection, and judge telemetry
