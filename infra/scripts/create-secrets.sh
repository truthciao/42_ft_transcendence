#!/bin/sh
set -eu
umask 077

# Locate the project root.
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)

ENV_FILE="$PROJECT_ROOT/apps/api/.env"
SECRETS_DIR="$PROJECT_ROOT/infra/secrets"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: apps/api/.env not found." >&2
    exit 1
fi

# Load the existing local environment configuration.
set -a
. "$ENV_FILE"
set +a

# Validate all required secrets before writing files.
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"
: "${TRANSCENDENCE_APP_PASSWORD:?TRANSCENDENCE_APP_PASSWORD is required}"
: "${TRANSCENDENCE_MIGRATOR_PASSWORD:?TRANSCENDENCE_MIGRATOR_PASSWORD is required}"
: "${DATABASE_URL_APP_DOCKER:?DATABASE_URL_APP_DOCKER is required}"
: "${DATABASE_URL_MIGRATOR_DOCKER:?DATABASE_URL_MIGRATOR_DOCKER is required}"
: "${GOOGLE_CLIENT_SECRET:?GOOGLE_CLIENT_SECRET is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
: "${MAIL_PASS:?MAIL_PASS is required}"
: "${SEED_ADMIN_PASSWORD:?SEED_ADMIN_PASSWORD is required}"

mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

write_secret() {
    name="$1"
    value="$2"
    target="$SECRETS_DIR/$name.txt"
    tmp=$(mktemp "$SECRETS_DIR/.secret.XXXXXX")

    if ! printf '%s' "$value" > "$tmp"; then
        rm -f "$tmp"
        echo "Error: failed to write secret '$name'." >&2
        exit 1
    fi

    chmod 644 "$tmp"
    mv -f "$tmp" "$target"
    echo "Generated $name.txt"
}

write_secret postgres_admin_password "$POSTGRES_PASSWORD"
write_secret postgres_app_password "$TRANSCENDENCE_APP_PASSWORD"
write_secret postgres_migrator_password "$TRANSCENDENCE_MIGRATOR_PASSWORD"

write_secret database_url_app "$DATABASE_URL_APP_DOCKER"
write_secret database_url_migrator "$DATABASE_URL_MIGRATOR_DOCKER"

write_secret google_client_secret "$GOOGLE_CLIENT_SECRET"
write_secret jwt_secret "$JWT_SECRET"
write_secret mail_pass "$MAIL_PASS"
write_secret seed_admin_password "$SEED_ADMIN_PASSWORD"

echo "Secret files generated successfully."

