#!/bin/sh
set -eu

# Read passwords from Podman Secrets.
export TRANSCENDENCE_APP_PASSWORD="$(cat /run/secrets/postgres_app_password)"
export TRANSCENDENCE_MIGRATOR_PASSWORD="$(cat /run/secrets/postgres_migrator_password)"

# Validate that the required secrets are not empty.
: "${TRANSCENDENCE_APP_PASSWORD:?App password secret is empty}"
: "${TRANSCENDENCE_MIGRATOR_PASSWORD:?Migrator password secret is empty}"

# Execute the role setup SQL.
psql \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --set ON_ERROR_STOP=1 \
    --file /infra/postgresql/scripts/01-setup-roles.sql
