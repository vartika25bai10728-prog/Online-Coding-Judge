# Apex Online Coding Judge

A full-stack online coding platform where users can solve programming problems, submit solutions, and get their results.

## Features

* User registration and login
* Browse and search coding problems
* Code editor for submissions
* Code execution and test case evaluation
* Submission history
* Java, Python, C++ and Node.js support
* Docker-based code execution
* PostgreSQL database
* Redis-based submission queue
* JWT authentication

## Tech Stack

**Frontend**

* React
* TypeScript
* Vite
* Monaco Editor

**Backend**

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA

**Database & Infrastructure**

* PostgreSQL
* Redis
* Docker
* Flyway

## How It Works

```text
User
  ↓
Frontend
  ↓
Spring Boot API
  ↓
Redis Queue
  ↓
Judge Worker
  ↓
Docker Container
  ↓
Test Cases
  ↓
Result
```

When a solution is submitted, the backend adds it to the judging queue. A worker processes the submission and runs the code in an isolated environment. The result is then stored and returned to the user.

## Running Locally

### Requirements

* Java 21
* Maven 3.9+
* Node.js
* PostgreSQL
* Redis
* Docker

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
npm install
npm run dev
```

### Docker

```bash
docker compose up --build
```

## Project Structure

```text
Online-Coding-Judge/
├── backend/       # Spring Boot backend
├── src/           # React frontend
├── docker-compose.yml
├── package.json
└── server.ts
```

## Status

This project is under development.

## License

For educational use.
