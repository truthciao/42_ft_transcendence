.PHONY: help install dev build lint typecheck test test-api test-web test-e2e \
        ci db-up db-down db-logs db-migrate db-generate clean

help:
	@echo "Available commands:"
	@echo "  make install       Install dependencies"
	@echo "  make dev           Start API and web in dev mode"
	@echo "  make build         Build the project"
	@echo "  make lint          Run linters"
	@echo "  make typecheck     Run TypeScript checks"
	@echo "  make test          Run API + web unit tests"
	@echo "  make test-api      Run API unit tests"
	@echo "  make test-web      Run web unit tests"
	@echo "  make test-e2e      Run API E2E tests"
	@echo "  make ci            Run local CI checks"
	@echo "  make db-up         Start PostgreSQL"
	@echo "  make db-down       Stop PostgreSQL"
	@echo "  make db-logs       Show PostgreSQL logs"
	@echo "  make db-generate   Generate Prisma client"
	@echo "  make db-migrate    Apply Prisma migrations"
	@echo "  make clean         Remove build artifacts"

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test: test-api test-web

test-api:
	pnpm --filter api test:ci

test-web:
	pnpm --filter web test:run

test-e2e:
	pnpm --filter api test:e2e

ci:
	pnpm lint
	pnpm typecheck
	pnpm --filter api test:ci
	pnpm --filter web test:run
	pnpm build

db-up:
	docker compose up -d postgres

db-down:
	docker compose stop postgres

db-logs:
	docker compose logs -f postgres

db-generate:
	pnpm --filter api exec prisma generate

db-migrate:
	pnpm --dir apps/api exec prisma migrate deploy

clean:
	rm -rf apps/api/dist
	rm -rf apps/web/dist
