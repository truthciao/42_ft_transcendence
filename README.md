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
## Local HTTPS Setup

The project uses **Nginx + mkcert** to provide HTTPS locally at:

```text
https://localhost
```

Local TLS certificates are **not committed to Git**. Each developer must generate and trust their own certificates once on their machine.

### 1. Install `mkcert`

Install `mkcert` using the package manager for your platform.

**Ubuntu / Debian / WSL**

```bash
sudo apt update
sudo apt install -y mkcert libnss3-tools
```

**macOS**

```bash
brew install mkcert
brew install nss # optional, required for Firefox
```

**Windows**

Install `mkcert` using your preferred Windows package manager or from the official mkcert releases.

### 2. Generate the local certificate

From the project root:

```bash
make certs
```

This installs the local mkcert CA and generates certificates for:

```text
localhost
127.0.0.1
::1
```

The generated files are stored under:

```text
infra/nginx/certs/
```

Then start the application:

```bash
make start
```

Open:

```text
https://localhost
```

### WSL + Windows browsers

If `mkcert` runs inside WSL but Chrome/Edge runs on Windows, `mkcert -install` only installs the CA inside the Linux/WSL environment. Windows may therefore still report the certificate as untrusted.

Find the WSL CA:

```bash
mkcert -CAROOT
```

Copy `rootCA.pem` from that directory to Windows, then open an **Administrator PowerShell** and run:

```powershell
certutil -addstore -f Root C:\path\to\rootCA.pem
```

Completely restart the browser afterward.

> Never share or commit `rootCA-key.pem`, `localhost.key`, or other private keys. Each developer should generate their own local certificates.

### Troubleshooting

If `https://localhost` still appears as insecure:

* Make sure `make certs` completed successfully.
* Make sure the browser's operating system trusts the mkcert root CA.
* Completely restart the browser after installing the CA.
* If using WSL, remember that WSL and Windows have separate certificate trust stores.
* Verify that the certificate contains `localhost` in its Subject Alternative Names (SAN).

---

# License

42 School Project
