#!/bin/sh

set -eu

# Read DATABASE_URL from a mounted Podman Secret.
if [ -n "${DATABASE_URL_SECRET_FILE:-}" ]; then
    if [ ! -r "$DATABASE_URL_SECRET_FILE" ]; then
        echo "Error: database URL secret is not readable." >&2
        exit 1
    fi

    DATABASE_URL=$(cat "$DATABASE_URL_SECRET_FILE")
    export DATABASE_URL
fi

echo "Synchronizing workspace dependencies..."


pnpm install \
  --frozen-lockfile \
  --config.confirmModulesPurge=false

echo "Building shared types..."

pnpm --filter @repo/shared-types build

if [ "${GENERATE_PRISMA:-false}" = "true" ]; then
  echo "Generating Prisma Client..."
  pnpm --dir apps/api exec prisma generate
fi

echo "Dependencies are ready."

exec "$@"
