# ft_transcendence

A full-stack web application built for the 42 School `ft_transcendence` project.

## Tech Stack

### Frontend

- React
- Vite
- TypeScript

### Backend

- NestJS
- Prisma ORM

### Database

- PostgreSQL
- Docker Compose

### Monorepo

- pnpm Workspace

---

# Project Structure

```text
transcendence/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # React frontend
├── packages/       # Shared packages
├── docs/
├── infra/
├── scripts/
├── compose.yaml
└── pnpm-workspace.yaml
```

---

# Requirements

Before running the project, install the following software.

## Node.js

Recommended version:

```
>= 22
```

If you use **nvm**:

```bash
nvm install
nvm use
```

---

## pnpm

Install globally:

```bash
npm install -g pnpm
```

Check:

```bash
pnpm -v
```

---

## Docker

Install Docker Desktop.

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

Install all dependencies:

```bash
pnpm install
```

---

# Environment Variables

Create the environment file or change the name of example file:

```text
apps/api/.env
```

Example:

```env
DATABASE_URL="postgresql://transcendence:transcendence@localhost:5432/transcendence?schema=public"
```

---

# Start PostgreSQL

Start the database:

```bash
docker compose up -d postgres
```

Check the container:

```bash
docker compose ps
```

---

# Prisma

Generate Prisma Client:

```bash
pnpm --filter api exec prisma generate
```

Run database migrations:

```bash
pnpm --filter api exec prisma migrate dev
```

---

# Start Development Server

Run both frontend and backend:

```bash
pnpm dev
```

Services:

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:3000
```

---

# Available Scripts

## Run all applications

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

# Database

Open PostgreSQL:

```bash
docker compose exec postgres psql -U transcendence -d transcendence
```

List tables:

```sql
\dt
```

Exit:

```sql
\q
```

---

# Current Status

The project is initialized with:

- pnpm Workspace
- React + Vite + TypeScript
- NestJS
- PostgreSQL
- Docker Compose
- Prisma ORM
- Initial database migration
- Generated Prisma Client

The following features are **not implemented yet**:

- Authentication
- OAuth 42
- User CRUD
- WebSocket
- Chat
- Friends
- Match History

---

# Development Workflow

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Start development servers:

```bash
pnpm dev
```

After modifying the Prisma schema:

```bash
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma generate
```

---

# License

42 School Project