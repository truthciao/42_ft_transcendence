# ft_transcendence

A full-stack web application built for the 42 School **ft_transcendence** project.

---

# Tech Stack

## Frontend

- React
- Vite
- TypeScript

## Backend

- NestJS
- Prisma ORM

## Database

- PostgreSQL

## Infrastructure

- Docker
- Docker Compose

## Monorepo

- pnpm Workspace

---

# Project Structure

```text
transcendence/
├── apps/
│   ├── api/                 # NestJS backend
│   └── web/                 # React frontend
├── packages/                # Shared packages
├── docs/
├── infra/
├── scripts/
├── compose.yaml
└── pnpm-workspace.yaml
```

---

# Requirements

Install the following software before running the project.

## Node.js

Recommended version:

```text
>= 22
```

Using nvm:

```bash
nvm install
nvm use
```

---

## pnpm

Install pnpm:

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm -v
```

---

## Docker

Install Docker Desktop (Windows/macOS) or Docker Engine + Docker Compose (Linux).

Verify:

```bash
docker --version
docker compose version
```

---

# Installation

Clone the repository:

```bash
git clone <repository-url>
cd transcendence
```

Install dependencies:

```bash
pnpm install
```

---

# Local Development

Run the frontend and backend directly on your local machine.

## 1. Start PostgreSQL

If PostgreSQL is installed locally, ensure it is running.

Alternatively, start only the database with Docker:

```bash
docker compose up -d postgres
```

---

## 2. Configure environment variables

Create:

```text
apps/api/.env
```

Example:

```env
DATABASE_URL="postgresql://transcendence:transcendence@localhost:5432/transcendence?schema=public"
```

Additional variables (JWT secrets, OAuth credentials, etc.) can be added as the project grows.

---

## 3. Generate Prisma Client

```bash
pnpm --filter api exec prisma generate
```

---

## 4. Apply database migrations

```bash
pnpm --filter api exec prisma migrate dev
```

---

## 5. Start the application

```bash
pnpm dev
```

Applications:

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

---

# Docker Development

Run the complete development environment inside Docker.

## Build and start

```bash
docker compose up --build
```

Or run in the background:

```bash
docker compose up -d --build
```

Docker automatically starts:

- PostgreSQL
- Prisma Client generation
- Database migrations
- NestJS API
- React (Vite)

Applications:

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

---

## Stop containers

```bash
docker compose down
```

---

## Remove database volume

> Warning: This removes all local PostgreSQL data.

```bash
docker compose down -v
```

---

## View running containers

```bash
docker compose ps
```

---

## View logs

All services:

```bash
docker compose logs -f
```

Backend:

```bash
docker compose logs -f api
```

Frontend:

```bash
docker compose logs -f web
```

Database:

```bash
docker compose logs -f postgres
```

---

## Rebuild containers

```bash
docker compose up --build
```

---

# Available Scripts

Run the entire project locally:

```bash
pnpm dev
```

---

Build:

```bash
pnpm build
```

---

Lint:

```bash
pnpm lint
```

---

Backend only:

```bash
pnpm --filter api dev
```

---

Frontend only:

```bash
pnpm --filter web dev
```

---

Backend tests:

```bash
pnpm --filter api test
```

Coverage:

```bash
pnpm --filter api test:cov
```

---

# PostgreSQL

Connect to PostgreSQL:

```bash
docker compose exec postgres psql \
    -U transcendence \
    -d transcendence
```

List tables:

```sql
\dt
```

Describe a table:

```sql
\d table_name
```

Exit:

```sql
\q
```

---

# Prisma Workflow

This section applies to **Local Development** only.

Whenever the Prisma schema changes:

Create a migration:

```bash
pnpm --filter api exec prisma migrate dev
```

Regenerate the Prisma Client:

```bash
pnpm --filter api exec prisma generate
```

If only the generated client needs updating:

```bash
pnpm --filter api exec prisma generate
```

---

# Docker Tips

Restart a specific service:

```bash
docker compose restart postgres
docker compose restart api
docker compose restart web
```

Rebuild containers:

```bash
docker compose up --build
```

Rebuild without cache:

```bash
docker compose build --no-cache
```

Remove orphan containers:

```bash
docker compose down --remove-orphans
```

---

# License

42 School Project
