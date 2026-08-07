# ft_transcendence

A full-stack web application built for the 42 School **ft_transcendence** project.

## Tech Stack

### Frontend

* React
* Vite
* TypeScript

### Backend

* NestJS
* Prisma ORM

### Database

* PostgreSQL

### Infrastructure

* Docker
* Docker Compose

### Monorepo

* pnpm Workspace

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

Using **nvm**:

```bash
nvm install
nvm use
```

---

## pnpm

Install pnpm globally:

```bash
npm install -g pnpm
```

Verify the installation:

```bash
pnpm -v
```

---

## Docker

Install Docker Desktop (or Docker Engine + Docker Compose on Linux).

Verify your installation:

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

Install all dependencies:

```bash
pnpm install
```

---

# Environment Variables

Create an environment file for the backend.

```text
apps/api/.env
```

Example:

```env
DATABASE_URL="postgresql://transcendence:transcendence@localhost:5432/transcendence?schema=public"
```

Additional environment variables (JWT secrets, OAuth credentials, etc.) can be added as the project grows.

---

# Docker

The project uses Docker Compose to manage local services such as PostgreSQL.

## Start all services

```bash
docker compose up -d
```

## Start only PostgreSQL

```bash
docker compose up -d postgres
```

## Stop containers

```bash
docker compose down
```

## Stop and remove volumes

> Warning: this removes all local database data.

```bash
docker compose down -v
```

## View running containers

```bash
docker compose ps
```

## View logs

```bash
docker compose logs -f
```

View logs for PostgreSQL only:

```bash
docker compose logs -f postgres
```

---

# Database Setup

Generate the Prisma Client:

```bash
pnpm --filter api exec prisma generate
```

Apply database migrations:

```bash
pnpm --filter api exec prisma migrate dev
```

If the database is empty, Prisma will automatically create it and apply all migrations.

---

# Running the Application

Start the development servers:

```bash
pnpm dev
```

The application will be available at:

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

---

# Available Scripts

## Run the entire project

```bash
pnpm dev
```

---

## Build

```bash
pnpm build
```

---

## Lint

```bash
pnpm lint
```

---

## Backend only

```bash
pnpm --filter api dev
```

---

## Frontend only

```bash
pnpm --filter web dev
```

---

## Backend tests

```bash
pnpm --filter api test
```

Run tests with coverage:

```bash
pnpm --filter api test:cov
```

---

# Working with PostgreSQL

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

Whenever the Prisma schema changes:

Create a new migration:

```bash
pnpm --filter api exec prisma migrate dev
```

Regenerate the Prisma Client:

```bash
pnpm --filter api exec prisma generate
```

If you only need to regenerate the client:

```bash
pnpm --filter api exec prisma generate
```

---

# Docker Tips

Restart PostgreSQL:

```bash
docker compose restart postgres
```

Rebuild containers:

```bash
docker compose up --build
```

Remove unused Docker resources:

```bash
docker system prune
```

---

# Development Workflow

1. Start Docker services.

```bash
docker compose up -d
```

2. Install dependencies.

```bash
pnpm install
```

3. Apply database migrations.

```bash
pnpm --filter api exec prisma migrate dev
```

4. Generate the Prisma Client.

```bash
pnpm --filter api exec prisma generate
```

5. Start the application.

```bash
pnpm dev
```

---

# License

42 School Project
