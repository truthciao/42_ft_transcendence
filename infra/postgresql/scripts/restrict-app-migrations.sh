
#!/bin/sh
set -eu

: "${DATABASE_URL_SECRET_FILE:?DATABASE_URL_SECRET_FILE is required}"

if [ ! -r "$DATABASE_URL_SECRET_FILE" ]; then
    echo "Error: database URL Secret is not readable." >&2
    exit 1
fi

# Parse the connection URL without exporting the full URL.
node -e '
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");

const secretFile = process.env.DATABASE_URL_SECRET_FILE;
const url = new URL(fs.readFileSync(secretFile, "utf8").trim());

if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
  throw new Error("Unsupported database URL protocol");
}

const database = decodeURIComponent(url.pathname.slice(1));

if (!database || !url.hostname || !url.username) {
  throw new Error("Database URL is missing required connection fields");
}

const env = { ...process.env };
delete env.DATABASE_URL;

env.PGHOST = url.hostname;
env.PGPORT = url.port || "5432";
env.PGDATABASE = database;
env.PGUSER = decodeURIComponent(url.username);
env.PGPASSWORD = decodeURIComponent(url.password);

const result = spawnSync("psql", [
  "-v", "ON_ERROR_STOP=1",
  "-f", "/app/infra/postgresql/scripts/02-restrict-app-migrations.sql"
], {
  stdio: "inherit",
  env
});

if (result.error) {
  console.error("Error: failed to execute psql.");
  process.exit(1);
}

process.exit(result.status ?? 1);
'

