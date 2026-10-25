#!/bin/sh
set -eu

HBA_FILE="${PGDATA}/pg_hba.conf"

if [ ! -f "$HBA_FILE" ]; then
    echo "ERROR: pg_hba.conf not found: $HBA_FILE" >&2
    exit 1
fi

# Replace insecure trust authentication with SCRAM password authentication.
sed -i 's/[[:space:]]trust[[:space:]]*$/ scram-sha-256/' "$HBA_FILE"

echo "Updated PostgreSQL authentication rules in $HBA_FILE"

