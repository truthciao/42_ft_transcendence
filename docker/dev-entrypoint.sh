#!/bin/sh
set -eu

echo "Synchronizing workspace dependencies..."

pnpm install \
  --frozen-lockfile \
  --config.confirmModulesPurge=false

echo "Dependencies are ready."

exec "$@"