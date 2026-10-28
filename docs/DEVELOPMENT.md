# Development Guide

This document contains development, testing, database, Docker, and infrastructure instructions for **ft_transcendence**.

For evaluator-oriented setup and application usage, see the root [README.md](../README.md).

---

## Project Structure

The project is organized as a pnpm monorepo, with separate frontend and backend applications, shared TypeScript types, and infrastructure configuration.

```text
transcendence/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── migrations/       # Database schema migrations
│   │   │   ├── schema.prisma     # Prisma data models
│   │   │   └── seed.ts           # Database seed data
│   │   ├── src/
│   │   │   ├── modules/          # Feature modules and business logic
│   │   │   ├── prisma/           # Prisma service and module
│   │   │   ├── config/           # Backend configuration
│   │   │   ├── generated/        # Generated Prisma Client
│   │   │   └── main.ts           # API entry point
│   │   └── test/                 # End-to-end tests
│   │
│   └── web/
│       └── src/
│           ├── api/              # HTTP API client functions
│           ├── auth/             # Authentication context and provider
│           ├── components/       # Reusable UI components
│           ├── hooks/            # Custom React hooks
│           ├── layouts/          # Application layouts
│           ├── lib/              # Shared utilities and client setup
│           ├── pages/            # Application pages
│           ├── realtime/         # Realtime connection and context
│           ├── router/           # Route configuration
│           └── i18n/             # Internationalization and translations
│
├── packages/
│   └── shared-types/
│       └── src/                  # Shared TypeScript types and Zod schemas
│
├── docs/                         # Architecture, database and development docs
├── infra/
│   ├── nginx/                    # Reverse proxy and TLS configuration
│   ├── postgresql/               # Database initialization and role scripts
│   └── scripts/                  # Infrastructure automation
├── docker/
│   └── dev-entrypoint.sh         # Development container entry point
│
├── compose.yaml                  # Container orchestration
├── Dockerfile.dev                 # Development image
├── Makefile                      # Common development commands
├── package.json                  # Root workspace configuration
└── pnpm-workspace.yaml            # pnpm workspace definition
```

### Directory Responsibilities

| Directory | Purpose |
|---|---|
| `apps/api/src/modules/` | Backend features, including authentication, chat, friends, documents, notifications, users and workspaces |
| `apps/api/prisma/` | Database schema, migrations and seed scripts |
| `apps/api/test/` | End-to-end API tests |
| `apps/web/src/components/` | Reusable frontend components grouped by feature |
| `apps/web/src/hooks/` | Custom hooks for data fetching, mutations and realtime interactions |
| `apps/web/src/api/` | Frontend functions for calling backend endpoints |
| `packages/shared-types/` | Types and Zod schemas shared between the frontend and backend |
| `infra/` | Reverse proxy, PostgreSQL initialization and infrastructure scripts |
| `docs/` | Technical documentation and development guides |

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

## Container Engine

Choose **one** of the following container setups.

### Option 1: Docker

Install Docker Engine and the Docker Compose plugin on Linux, or Docker Desktop on Windows/macOS.

Verify the required tools:

```bash
docker --version
docker compose version
make --version
openssl version
```

### Option 2: Podman

Install Podman and a compatible Compose provider. On Linux, the required packages and setup may vary by distribution.

Verify the required tools:

```bash
podman --version
podman compose --version
make --version
openssl version
```

**Note:** Depending on your Podman setup, you may use Docker Compose with Podman's Docker-compatible API instead of `podman compose`. Ensure that your Compose implementation supports the features used by this project, including Compose secrets and service dependencies.

---

# Installation

Clone the repository:

```bash
git clone git@github.com:truthciao/42_ft_transcendence.git
cd transcendence
```

Install dependencies:

```bash
pnpm install
```

---
# Environment Variables
Create your local environment configuration from the example provided by the project:

```bash
cp apps/api/.env.example apps/api/.env
```

Configure the required variables in apps/api/.env before starting the application. Replace the placeholder values with your own credentials and settings, including Google OAuth credentials, database passwords, and the JWT secret.

For details, see the
[Environment Configuration Guide](environment-configuration.md).

The .env file and generated secret files are local configuration files and must not be committed to version control.

# Containerized Development
The project uses Docker Compose or a compatible Podman Compose provider to run the development environment.

## Prerequisites

Install one of the following container engines:

- Docker Engine with Docker Compose.
- Podman with a compatible Compose provider.

GNU Make and OpenSSL are also required.

The Compose provider must support the features used by the project, including secrets and service dependencies.

## Build and Start

From the project root, run:

```bash
make start
```

The Makefile prepares the local development certificate and generates the required secret files before starting the environment.

The Compose environment includes:

- PostgreSQL
- Database migration service
- NestJS API
- React / Vite frontend
- Nginx HTTPS reverse proxy

## Access the Application

The application is served through Nginx over HTTPS.

- HTTPS: `https://localhost:8443`
- HTTP: `http://localhost:8080` (redirects to HTTPS)

The local development certificate is self-signed, so your browser may display a certificate warning.

---

# Makefile

The project provides a Makefile for common development operations.

```bash
make start      # Build and start the full Docker stack
make stop       # Stop all containers
make restart    # Restart the Docker stack
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

Keep database credentials in the local environment configuration. Never commit real database passwords to Git.

## Connect to the PostgreSQL Container

Make sure the PostgreSQL container is running, then connect using the administrative account:

```bash
docker compose --env-file ./apps/api/.env exec postgres psql \
    -U transcendence \
    -d transcendence
```

Enter `POSTGRES_PASSWORD` if prompted.

**Note:** The administrative account is for database management only. Do not use it for normal API requests.



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

## Database Migrations

When developing database changes, use `prisma migrate dev` to create a migration.

**Prerequisite:** Make sure the PostgreSQL container is running and the database is ready before creating a migration.

```bash
# only if necessary
make db-up
```

**1. Temporarily allow the migrator to create databases**

Run the command below. Enter `POSTGRES_PASSWORD` [(check out in environment-configuraton)](./environment-configuration.md) when prompted to access PostgreSQL and change the migrator's permissions.

```bash
docker compose --env-file ./apps/api/.env exec postgres \
  sh -c 'psql -U "$POSTGRES_USER" -d postgres -c "ALTER ROLE transcendence_migrator CREATEDB;"'
```

**2. Create and apply the migration**

Replace `add_your_change` with a short name describing your change.

```bash
docker compose --env-file ./apps/api/.env run --rm migrate \
  /app/docker/dev-entrypoint.sh sh -c \
  'pnpm --dir apps/api exec prisma generate && pnpm --dir apps/api exec prisma migrate dev --name add_your_change'
```

**3. Remove the temporary permission**

```bash
docker compose --env-file ./apps/api/.env exec postgres \
  sh -c 'psql -U "$POSTGRES_USER" -d postgres -c "ALTER ROLE transcendence_migrator NOCREATEDB;"'
```

**4. Check the migration**

Review the generated SQL in `apps/api/prisma/migrations/` before committing the migration and schema changes.


> **Important:** Always run step 3 after the migration attempt, even if it fails.

---

# Docker Operations

## Stop containers

```bash
docker compose --env-file ./apps/api/.env down
```

## Remove database volume

> **Warning:** This deletes all local PostgreSQL data.

```bash
docker compose --env-file ./apps/api/.env down -v
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

# Troubleshooting

## Check containers

```bash
docker compose --env-file ./apps/api/.env ps
```

## Check API logs

```bash
docker compose --env-file ./apps/api/.env logs -f api
```

## Check frontend logs

```bash
docker compose --env-file ./apps/api/.env logs -f web
```

## Check database logs

```bash
docker compose --env-file ./apps/api/.env logs -f postgres
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

> **Warning:** This removes Docker volumes and local database data.

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
