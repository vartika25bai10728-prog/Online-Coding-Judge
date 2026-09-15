# Apex Online Judge — Java 21 & Spring Boot 3 Backend

This directory contains the complete, standalone **Java 21 + Spring Boot 3** academic online coding judge platform.

---

## 🏛️ Architecture Breakdown

- **Java Spring Boot 3 (`com.apex.judge.*`)**: The core application logic and backend.
- **Spring Data JPA & Hibernate**: Relational persistence and query mappings.
- **Spring Security & JJWT**: Stateless token verification, BCrypt password hashing, and role-based endpoints.
- **Redis Queue Service**: Asynchronous FIFO submission queueing (`RPUSH` / `BLPOP`).
- **Flyway**: Database schema migration (`V1__init_schema.sql`) and seed data (`V2__seed_data.sql`).
- **Sandbox Executor**: Isolated process execution with memory constraints and strict timeout enforcement.

---

## Java Backend Setup and Execution

### 1. Run using Docker Compose (Recommended)

To start PostgreSQL 16, Redis 7, and the Java application in containers:

```bash
# From within the /backend directory:
docker compose up --build
```

### 2. Build and Run with Maven (Local CLI)

Ensure Java 21 and Maven are installed on your machine:

```bash
# Run unit and integration tests
mvn clean test

# Build executable JAR
mvn clean package

# Run the packaged Spring Boot JAR
java -jar target/apex-judge-backend-1.0.0.jar
```

Alternatively, launch directly in development mode:

```bash
mvn spring-boot:run
```
