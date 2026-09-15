# Apex Online Coding Judge

Apex Online Coding Judge is an academic, production-grade distributed online judge system whose **primary application and academic codebase is implemented entirely in Java 21 and Spring Boot 3**.

---

## 🏛️ System Architecture

The project is architected with clear role boundaries:

| Layer | Technology | Primary Role in the Architecture |
| :--- | :--- | :--- |
| **Frontend UI** | **React / TypeScript** | **Temporary AI Studio development UI** (used exclusively for live preview, rapid interaction testing, and AI Studio development environment compliance). |
| **Core Application / Backend** | **Java 21 + Spring Boot 3** | **The true core application logic and backend**. Houses all REST controllers, Spring Security & JWT filters, domain models, Spring Data JPA repositories, Redis FIFO queues, and judge orchestration. |
| **Sandbox Execution** | **Docker / Isolated Containers** | **Isolated code execution**. Provides containerized sandboxes with cgroups memory caps and execution timeouts to safely run untrusted user submissions (Java, Python, C++, Node.js). |
| **Data Persistence** | **PostgreSQL 16 + Flyway** | **Persistent application data**. Stores ACID-compliant user accounts, problem descriptions, test cases, submission histories, and contest scoreboards versioned by Flyway database migrations. |

```
┌─────────────────────────────────────────────────────────────┐
│ React / TypeScript (Temporary AI Studio Development UI)     │
│ - Monaco Editor, Problem Explorer, Submissions Stream       │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTP / REST / JWT (/api/*)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│ Java 21 + Spring Boot 3 (Core Application / Backend)        │
│ ├── Spring MVC REST Controllers                             │
│ ├── Spring Security + Stateless JWT Filter                  │
│ ├── Spring Data JPA & Hibernate Entities                    │
│ └── JudgeQueueService & Asynchronous Redis Queue            │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│ PostgreSQL 16 + Flyway        │ │ Docker Isolated Execution │
│ (Persistent Application Data) │ │ (Code Sandbox & cgroups)  │
└───────────────────────────────┘ └───────────────────────────┘
```

---

## Java Backend Setup and Execution

The Java backend located in `/backend` is **completely standalone and independent**. It requires no Node.js, npm, or frontend assets to build, test, and run.

### Prerequisites

- **Java 21 LTS** (`openjdk-21-jdk` or `eclipse-temurin-21`)
- **Apache Maven 3.9+** (`mvn`)
- *(Optional for containerized run)* **Docker & Docker Compose**

---

### Option A: Run via Docker Compose (Recommended)

Starts PostgreSQL 16, Redis 7, and the Java 21 Spring Boot application together:

```bash
# 1. Navigate to the backend directory (or stay at repository root)
cd backend

# 2. Build the Docker image and start all services
docker compose up --build

# 3. To run in detached mode:
docker compose up -d

# 4. View live logs:
docker compose logs -f backend

# 5. Stop all services:
docker compose down
```

The Spring Boot backend will be live at `http://localhost:8080`.

---

### Option B: Build and Run with Maven (Local CLI)

If you have PostgreSQL and Redis running locally:

```bash
# 1. Enter the Java backend directory
cd backend

# 2. Run unit and integration tests
mvn clean test

# 3. Package the application into an executable JAR
mvn clean package -DskipTests=false

# 4. Run the Spring Boot JAR
java -jar target/apex-judge-backend-1.0.0.jar
```

#### Running directly with Spring Boot Maven Plugin:
```bash
cd backend
mvn spring-boot:run
```

#### Custom Environment Variables:
```bash
SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/apex_judge_db" \
SPRING_DATASOURCE_USERNAME="apex_user" \
SPRING_DATASOURCE_PASSWORD="apex_secure_password" \
SPRING_DATA_REDIS_HOST="localhost" \
SPRING_DATA_REDIS_PORT="6379" \
JWT_SECRET="c2VjdXJlLXN1cGVyLXNlY3JldC1qd3Qta2V5LWZvci1hcGV4LWp1ZGdlLXByb2R1Y3Rpb24tbXVzdC1iZS0yNTYtYml0cw==" \
java -jar target/apex-judge-backend-1.0.0.jar
```

---

## 📁 Java Backend Code Structure (`/backend`)

```
backend/
├── pom.xml                                    # Maven project definition (Java 21 & Spring Boot 3.3.0)
├── Dockerfile                                 # Multi-stage Eclipse Temurin 21 production image
├── docker-compose.yml                         # Standalone Postgres + Redis + Spring Boot stack
├── src/
│   ├── main/
│   │   ├── java/com/apex/judge/
│   │   │   ├── ApexJudgeApplication.java      # Spring Boot application entrypoint
│   │   │   ├── config/
│   │   │   │   ├── JwtAuthenticationFilter.java  # Stateless JWT security filter
│   │   │   │   ├── JwtService.java               # HMAC-SHA token generator & validator
│   │   │   │   ├── SecurityConfig.java           # Spring Security filter chain & CORS
│   │   │   │   └── WebSocketConfig.java          # STOMP/SockJS real-time message broker
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java           # User registration, login, and /me endpoints
│   │   │   │   ├── ProblemController.java        # Problem CRUD and search filters
│   │   │   │   └── SubmissionController.java     # Asynchronous code submission and test runs
│   │   │   ├── model/
│   │   │   │   ├── Problem.java                  # JPA Problem entity with starter code & limits
│   │   │   │   ├── Submission.java               # JPA Submission record with verdicts & stats
│   │   │   │   ├── TestCase.java                 # JPA TestCase entity with weights & visibility
│   │   │   │   └── User.java                     # JPA User entity with ratings & BCrypt credentials
│   │   │   ├── repository/
│   │   │   │   ├── ProblemRepository.java        # Spring Data JPA queries for problems
│   │   │   │   ├── SubmissionRepository.java     # Spring Data JPA queries for submissions
│   │   │   │   └── UserRepository.java           # Spring Data JPA queries for users
│   │   │   └── service/
│   │   │       ├── JudgeQueueService.java        # Redis FIFO submission queue (RPUSH / BLPOP)
│   │   │       ├── JudgeWorkerService.java       # Asynchronous daemon evaluation loop
│   │   │       └── SandboxExecutor.java          # Process executor with timeout & memory bounds
│   │   └── resources/
│   │       ├── application.yml                   # Production & default application properties
│   │       └── db/migration/
│   │           ├── V1__init_schema.sql           # Flyway DDL (users, problems, test_cases, submissions)
│   │           └── V2__seed_data.sql             # Flyway DML (default problems, test cases, contests)
│   └── test/
│       ├── java/com/apex/judge/
│       │   ├── config/JwtServiceTest.java        # Unit tests for JWT signing & extraction
│       │   └── service/SandboxExecutorTest.java  # Unit tests for execution bounds & language checks
│       └── resources/
│           └── application-test.yml              # In-memory H2 test configuration
```

---

## 🛡️ Database Migrations (Flyway)

Flyway handles automatic versioned database migration upon startup:
- **`V1__init_schema.sql`**: Creates tables for `users`, `problems`, `test_cases`, `submissions`, and `contests` with indexed foreign keys and ratings.
- **`V2__seed_data.sql`**: Seeds starter algorithmic problems (*Two Sum*, *Valid Parentheses*), public & hidden test cases, demo accounts, and active ICPC contests.

---

## ⚡ REST API Endpoints (Java Backend)

- `POST /api/auth/register` — Register a new programmer account.
- `POST /api/auth/login` — Authenticate and receive a signed JWT token.
- `GET  /api/auth/me` — Retrieve the authenticated user's profile.
- `GET  /api/problems` — List catalog problems with optional `?difficulty=` and `?search=` filters.
- `GET  /api/problems/{slug}` — Retrieve problem specifications and test cases.
- `POST /api/problems` — Create a new algorithmic problem (Admin).
- `POST /api/submissions` — Queue code for asynchronous evaluation (returns `202 Accepted`).
- `GET  /api/submissions` — Query submissions with optional `?userId=` or `?problemId=`.
- `POST /api/submissions/run` — Fast synchronous test case execution.
