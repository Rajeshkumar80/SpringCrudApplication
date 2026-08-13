# AI Powered Product Management System

[![CI](https://github.com/Rajeshkumar80/SpringCrudApplication/actions/workflows/ci.yml/badge.svg)](https://github.com/Rajeshkumar80/SpringCrudApplication/actions/workflows/ci.yml)

A full-stack AI-powered product (mobile phone) inventory management platform built with **Spring Boot 3** on the backend and **React 19 + Vite** on the frontend, with an **Ollama (llama3.2:1b)** local LLM powering all AI features.

## Features

| Area | Details |
|------|---------|
| Auth | JWT (HS256) auth with `ADMIN` and `VIEWER` roles, stateless security |
| Products | Full CRUD, pagination, sorting, search, image upload (JPEG/PNG/WEBP, 5 MB cap) |
| AI Chat with DB | Natural language questions translated to safe SQL and executed against the catalog |
| Business Analyst | AI-generated inventory insights, recommendations, risks and health score |
| Product Consultant | Tailored phone recommendations with pros/cons and alternatives |
| Recommendation AI | Rule-based scoring across 6 dimensions (gaming, camera, battery, display, performance, value) |
| AI Search | Natural language catalog search |
| Compare | Side-by-side comparison of 2–3 products with best-value highlighting |
| AI Caching | Caffeine response cache (10 min TTL, `X-Cache: HIT`) for AI endpoints |
| Rate Limiting | Bucket4j token bucket — 10 requests/min per IP on AI endpoints (HTTP 429 + `Retry-After`) |
| Dashboard / Analytics | Aggregated stats, charts, brand breakdowns |

## Tech Stack

- **Backend:** Java 21, Spring Boot 3.5, Spring Security, JWT (jjwt), Spring Data JPA, MySQL 8.4, Spring AI (Ollama), Caffeine, Bucket4j, JaCoCo
- **Frontend:** React 19, Vite, Recharts, Framer Motion, Axios, React Router (state-based navigation)
- **AI:** Ollama `llama3.2:1b` (local, offline)
- **CI:** GitHub Actions (Maven verify + MySQL service container, Vitest + production build)

## Quick Start (local development)

### 1. Prerequisites

- JDK 21, Node.js 22, MySQL 8.x, [Ollama](https://ollama.com) with `llama3.2:1b` pulled (`ollama pull llama3.2:1b`)

### 2. Database

```sql
CREATE DATABASE IF NOT EXISTS productdb;
```

Update `src/main/resources/application.properties` (defaults: `localhost:3305`, `root/root`) or override via env vars.

### 3. Backend (port 8888)

```bash
mvn spring-boot:run
```

### 4. Frontend (port 5173)

```bash
cd product-frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

### Default Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Viewer | `viewer` | `viewer123` |

## Testing & Coverage

- Backend: `mvn verify` — runs 42 JUnit 5 + Mockito tests and generates the JaCoCo report at `target/site/jacoco/index.html` (service-layer line coverage ≥ 60%)
- Frontend: `cd product-frontend && npm test` — runs the Vitest + React Testing Library suite

## CI

`.github/workflows/ci.yml` runs on every push/PR to `main`:

- **Backend:** JDK 21 + MySQL 8.4 service container, `mvn -B verify`, JaCoCo report artifact
- **Frontend:** Node 22, `npm ci`, `npm test`, `npm run build`

## Project Structure

```
.
├── src/main/java/com/example/Product/
│   ├── controller/     # REST endpoints
│   ├── service/        # business logic + AI services
│   ├── config/         # security, CORS, cache, rate limiting
│   ├── security/       # JWT filter + token service
│   ├── dto/ model/ repository/ exception/
│   └── SpringCrudApplication.java
├── src/test/java/      # JUnit 5 + Mockito test suites
├── product-frontend/   # React 19 + Vite SPA
│   ├── src/pages/      # feature pages
│   ├── src/components/ # sidebar, modals, chatbot
│   └── src/services/   # API clients
└── .github/workflows/ci.yml
```