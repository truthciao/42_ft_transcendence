# Development Guide

This document contains development, testing, database, Docker, and infrastructure instructions for **ft_transcendence**.

For evaluator-oriented setup and application usage, see the root `README.md`.

---

# Project Structure

```text
transcendence/
├── apps/
│   ├── api/                 # NestJS backend
│   └── web/                 # React frontend
├── packages/                # Shared packages
├── docs/                    # Documentation
├── infra/                   # Infrastructure configuration
├── scripts/                 # Development and CI scripts
├── compose.yaml             # Docker Compose configuration
├── Makefile                 # Common development commands
└── pnpm-workspace.yaml      # pnpm workspace configuration
```

---

# Tech Stack

## Frontend

* React
* Vite
* TypeScript
* React Router
* TanStack Query
* i18next / react-i18next
* shadcn/ui
* Tailwind CSS

## Backend

* NestJS
* Prisma ORM
* Zod
* nestjs-zod
* Socket.IO

## Database

* PostgreSQL

## Infrastructure

* Docker
* Docker Compose
* Nginx
* HTTPS / TLS

## Monorepo

* pnpm Workspace

---

# Requirements

## Node.js

Recommended version:

```text
>= 22
```

If the repository provides an `.nvmrc`, use:

```bash
nvm install
nvm use
```

Verify:

```bash
node -v
```

---

## pnpm

Install pnpm if necessary:

```bash
npm install -g pnpm
```

Verify:

```bash
pnpm -v
```

---

## Docker

Install Docker Desktop on Windows/macOS or Docker Engine and Docker Compose on Linux.

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

Local development runs the frontend and backend directly on the host machine while PostgreSQL can be provided by Docker.

## 1. Start PostgreSQL

Start only the database:

```bash
docker compose up -d postgres
```

---

## 2. Generate Prisma Client

```bash
pnpm --filter api exec prisma generate
```

---

## 3. Apply Database Migrations

```bash
pnpm --filter api exec prisma migrate dev
```

---

## 4. Start the Application

```bash
pnpm dev
```

The default local development endpoints are:

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:3000 |

---

# Docker Development

Docker Compose can run the complete development environment.

## Build and Start

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d --build
```

The Docker environment includes:

* PostgreSQL
* Database migration
* NestJS API
* React / Vite frontend
* Nginx HTTPS reverse proxy

---

# HTTPS Development

The application is served through Nginx over HTTPS.

Start the complete environment:

```bash
make start
```

The Makefile automatically generates a local development certificate when necessary.

The application is available at:

```text
https://localhost:8443
```

HTTP is available on:

```text
http://localhost:8080
```

and redirects to HTTPS.

The local certificate is self-signed, so browsers may display a certificate warning.


# Environment Variables
Create your local environment configuration from the example provided by the project:

```bash
cp apps/api/.env.example apps/api/.env
```

Configure the required variables in apps/api/.env before starting the application. Replace the placeholder values with your own credentials and settings, including Google OAuth credentials, database passwords, and the JWT secret.

For details, see the
[Environment Configuration Guide](environment-configuration.md).

The .env file and generated secret files are local configuration files and must not be committed to version control.

Once the configuration is complete, start the application:

```bash
make start
```

The Makefile automatically generates the required Docker Compose secret files before starting the services.



---

# Makefile

The project provides a Makefile for common development operations.

```bash
make start      # Build and start the full Docker stack
make stop       # Stop all containers
make restart    # Restart the Docker stack
make dev        # Run the project locally
make test       # Run unit tests
make test-e2e   # Run API end-to-end tests
make ci         # Run local CI checks
make db-up      # Start PostgreSQL only
make db-reset   # Reset the development database
make clean      # Remove build artifacts
make fclean     # Remove containers, volumes, and build artifacts
make re         # Clean everything and rebuild the Docker stack
```

To display available commands:

```bash
make help
```

> **Warning:** `make fclean` removes Docker volumes and therefore deletes local database data.

---

# Testing

## Unit Tests

Run the project's unit tests:

```bash
make test
```

For backend tests, tests can also be executed directly from the API workspace.

For example:

```bash
cd apps/api
npm exec tsc --noEmit
```

Then run a specific Jest test:

```bash
node --experimental-vm-modules ./node_modules/jest/bin/jest.js \
  src/modules/friends/friends.service.spec.ts \
  --runInBand
```

---

## End-to-End Tests

Run API end-to-end tests:

```bash
make test-e2e
```

---

## CI Checks

Run the project's local CI checks:

```bash
make ci
```

---

# PostgreSQL

## Database Users and Permissions

The project uses separate PostgreSQL accounts for different responsibilities:

- `transcendence`: Administrative account with superuser privileges. It should not be used for normal API requests.
- `transcendence_app`: Application runtime account used by the API to access business data. It is not a superuser and cannot create objects in the `public` schema.
- `transcendence_migrator`: Account used by the migration service to apply Prisma migrations.

In Docker Compose, the API uses `DATABASE_URL_APP_DOCKER`, while the migration service uses `DATABASE_URL_MIGRATOR_DOCKER`.

This separation follows the principle of least privilege and limits the permissions available to the application at runtime.

Keep database credentials in the local environment configuration. Never commit real database passwords to Git.</WritingBlock>

## Connect to the PostgreSQL container:

```bash
docker compose exec postgres psql \
    -U transcendence \
    -d transcendence
```

## List tables

```sql
\dt
```

## Describe a table

```sql
\d table_name
```

## Exit PostgreSQL

```sql
\q
```

---

# Prisma Workflow

The following commands are primarily intended for local development.

Whenever the Prisma schema changes, create a migration:

```bash
pnpm --filter api exec prisma migrate dev
```

Generate or regenerate the Prisma Client:

```bash
pnpm --filter api exec prisma generate
```

If only the generated Prisma Client needs to be updated:

```bash
pnpm --filter api exec prisma generate
```

Run the database seed:

```bash
pnpm --filter api exec prisma db seed
```

---

# Docker Operations

## Stop containers

```bash
docker compose down
```

## Remove database volume

> Warning: This deletes all local PostgreSQL data.

```bash
docker compose down -v
```

## View running containers

```bash
docker compose ps
```

## View all logs

```bash
docker compose logs -f
```

## View backend logs

```bash
docker compose logs -f api
```

## View frontend logs

```bash
docker compose logs -f web
```

## View database logs

```bash
docker compose logs -f postgres
```

## Restart a specific service

```bash
docker compose restart postgres
docker compose restart api
docker compose restart web
```

## Rebuild containers

```bash
docker compose up --build
```

## Rebuild without cache

```bash
docker compose build --no-cache
```

## Remove orphan containers

```bash
docker compose down --remove-orphans
```

---

# Internationalization

The frontend uses `i18next` and `react-i18next`.

Translation files are located under:

```text
apps/web/src/i18n/locales/
```

Currently supported languages:

```text
en
fr
zh
```

When adding user-facing text, make sure the corresponding translation keys are added to all supported locale files.

The project also provides an i18n audit script:

```bash
pnpm i18n:check
```

Use this check to detect potentially hardcoded user-facing strings, placeholders, ARIA labels, and toast messages that may require translation.

---

# Shared Types

Shared DTO and validation schemas are maintained in:

```text
packages/shared-types/
```

The package is used to share types and validation definitions between the frontend and backend.

When modifying shared schemas, make sure both applications continue to compile correctly.

---

# Application Architecture

The application follows a containerized full-stack architecture managed by Docker Compose. Nginx serves as the reverse proxy, connecting the React frontend and NestJS API to PostgreSQL and persistent file storage.
For a detailed overview of the system architecture, service responsibilities, and networking, see the [Architecture Documentation](ARCHITECTURE.md).


---

# Troubleshooting

## Check containers

```bash
docker compose ps
```

## Check API logs

```bash
docker compose logs -f api
```

## Check frontend logs

```bash
docker compose logs -f web
```

## Check database logs

```bash
docker compose logs -f postgres
```

## Restart the environment

```bash
make restart
```

## Full reset

If the local environment becomes inconsistent:

```bash
make fclean
make start
```

> This removes Docker volumes and local database data.

---

# Development Workflow

A typical development workflow is:

```text
1. Create or switch to a feature branch
2. Install/update dependencies when necessary
3. Start the development environment
4. Implement the feature
5. Update shared types if necessary
6. Update Prisma schema and migration if necessary
7. Add/update translations
8. Add/update tests
9. Run lint/type checks/tests
10. Run CI checks
11. Commit the changes
```

Before committing, it is recommended to run:

```bash
make test
make ci
```

---

# Documentation

The root `README.md` is intended primarily for evaluators and users.

This document is intended for developers working on the project.

Additional technical documentation can be added under:

```text
docs/
```
