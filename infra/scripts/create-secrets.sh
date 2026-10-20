#!/bin/sh
set -eu

# Locate the project root relative to this script.
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)

# Load local environment variables.
ENV_FILE="$PROJECT_ROOT/apps/api/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found in project root." >&2
    exit 1
fi

set -a
. "$ENV_FILE"
set +a

create_secret() {
    secret_name="$1"
    secret_value="$2"

    if [ -z "$secret_value" ]; then
        echo "Error: value for secret '$secret_name' is empty." >&2
        exit 1
    fi

    if podman secret inspect "$secret_name" >/dev/null 2>&1; then
        echo "Secret '$secret_name' already exists; leaving it unchanged."
    else
        printf '%s' "$secret_value" | podman secret create "$secret_name" -
        echo "Created secret '$secret_name'."
    fi
}

create_secret postgres_admin_password "${POSTGRES_PASSWORD:-}"
create_secret postgres_app_password "${TRANSCENDENCE_APP_PASSWORD:-}"
create_secret postgres_migrator_password "${TRANSCENDENCE_MIGRATOR_PASSWORD:-}"

create_secret database_url_app "${DATABASE_URL_APP_DOCKER:-}"
create_secret database_url_migrator "${DATABASE_URL_MIGRATOR_DOCKER:-}"

echo "Secret preparation completed."
