.PHONY: help install dev start stop restart build lint typecheck \
        test test-api test-web test-e2e ci \
        db-up db-down db-logs db-migrate db-generate db-reset \
        certs clean fclean

help:
	@echo "Available commands:"
	@echo "  make install       Install dependencies"
	@echo "  make dev           Start API and web locally in development mode"
	@echo "  make start         Start the full Docker stack"
	@echo "  make stop          Stop the Docker stack"
	@echo "  make restart       Restart the Docker stack"
	@echo "  make build         Build API and web"
	@echo "  make lint          Run linters"
	@echo "  make typecheck     Run TypeScript checks"
	@echo "  make test          Run API + web unit tests"
	@echo "  make test-api      Run API unit tests"
	@echo "  make test-web      Run web unit tests"
	@echo "  make test-e2e      Run API E2E tests"
	@echo "  make ci            Run local CI checks"
	@echo "  make db-up         Start PostgreSQL only"
	@echo "  make db-down       Stop PostgreSQL"
	@echo "  make db-logs       Show PostgreSQL logs"
	@echo "  make db-generate   Generate Prisma client"
	@echo "  make db-migrate    Apply Prisma migrations"
	@echo "  make db-reset      Reset the development database"
	@echo "  make clean         Remove build artifacts"
	@echo "  make fclean        Remove containers, volumes and build artifacts"

install:
	pnpm install

# Local development
dev:
	pnpm dev

certs:
	@mkdir -p infra/nginx/certs
	@if [ -f infra/nginx/certs/localhost.pem ] && \
	    [ -f infra/nginx/certs/localhost-key.pem ]; then \
		echo "Local TLS certificates already exist."; \
	else \
		echo "Generating self-signed TLS certificate..."; \
		openssl req -x509 -nodes -newkey rsa:2048 \
			-keyout infra/nginx/certs/localhost-key.pem \
			-out infra/nginx/certs/localhost.pem \
			-days 365 \
			-subj "/CN=localhost" \
			-addext "subjectAltName=DNS:localhost,IP:127.0.0.1"; \
	fi
	
# Full Docker environment
start: certs
	docker compose --env-file ./apps/api/.env up -d

rebuild: certs
	docker compose --env-file ./apps/api/.env up -d --build

stop:
	docker compose down

restart: certs
	docker compose restart

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

db-reset:
	pnpm --dir apps/api exec prisma migrate reset


clean:
	rm -rf apps/api/dist
	rm -rf apps/web/dist

fclean: stop clean
	docker compose down -v --remove-orphans

re: fclean start
