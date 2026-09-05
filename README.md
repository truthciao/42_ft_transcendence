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

Generate a JWT_SECRET environnement varialble by executing the command below:

    openssl rand -base64 32

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

### Makefile

A `Makefile` is provided to simplify common development, testing, and Docker operations.

```bash
make start      # Build and start the full Docker stack
make stop       # Stop all containers
make restart    # Restart the Docker stack
make dev        # Run the project locally in development mode

make test       # Run unit tests
make test-e2e   # Run API end-to-end tests
make ci         # Run local CI checks

make db-up      # Start PostgreSQL only
make db-reset   # Reset the development database

make clean      # Remove build artifacts
make fclean     # Remove containers, volumes, and build artifacts
make re         # Clean everything and rebuild the Docker stack
```

Run `make help` to see all available commands.

> **Note:** `make fclean` removes Docker volumes and will delete local database data.

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

Regenerate the Prisma db seed:

```bash
pnpm --filter api exec prisma db seed
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

## HTTPS

The application is served through Nginx over HTTPS.

### Setup

Make sure OpenSSL is installed, then start the project:

```bash
make start
```

`make start` automatically generates a local self-signed TLS certificate if one does not already exist.

Open the application at:

```text
https://localhost:8443
```

HTTP is available on port `8080` and redirects to HTTPS.

> The certificate is self-signed for local development. Your browser may display a certificate warning. No system CA installation or administrator privileges are required.

### Google OAuth

Google OAuth is required to test the login functionality.

Create a `.env` file at:

./apps/api/.env

Copy the following configuration into this file and replace the placeholders with your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

The Google OAuth client must have the following Authorized redirect URI configured:

```text
GOOGLE_CALLBACK_URL="https://localhost:8443/api/auth/google/callback"
```

The project will automatically load these credentials when started with the provided Makefile.

Do not commit `.env`, generated certificates, or private keys.

---

# License

42 School Project
