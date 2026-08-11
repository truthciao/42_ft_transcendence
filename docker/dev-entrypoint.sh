#!/bin/sh
set -eu

echo "Synchronizing workspace dependencies..."

pnpm install \
  --frozen-lockfile \
  --config.confirmModulesPurge=false

if [ "${GENERATE_PRISMA:-false}" = "true" ]; then
  echo "Generating Prisma Client..."
  pnpm --dir apps/api exec prisma generate
fi

echo "Dependencies are ready."

exec "$@"