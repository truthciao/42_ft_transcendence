-- Read passwords from the PostgreSQL container environment.
\getenv app_password TRANSCENDENCE_APP_PASSWORD
\getenv migrator_password TRANSCENDENCE_MIGRATOR_PASSWORD

-- Create roles only if they do not already exist.
SELECT format('CREATE ROLE transcendence_app LOGIN')
WHERE NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'transcendence_app'
)
\gexec

SELECT format('CREATE ROLE transcendence_migrator LOGIN')
WHERE NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'transcendence_migrator'
)
\gexec

-- Set passwords from environment variables.
ALTER ROLE transcendence_app
    LOGIN PASSWORD :'app_password'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

ALTER ROLE transcendence_migrator
    LOGIN PASSWORD :'migrator_password'
    NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

-- Database connection permissions.
GRANT CONNECT ON DATABASE transcendence
    TO transcendence_app, transcendence_migrator;

-- The migrator manages the public schema.
ALTER SCHEMA public OWNER TO transcendence_migrator;
GRANT USAGE ON SCHEMA public TO transcendence_app;
GRANT USAGE, CREATE ON SCHEMA public TO transcendence_migrator;

-- Transfer existing tables and views to the migrator.
DO $$
DECLARE
    obj RECORD;
BEGIN
    FOR obj IN
        SELECT c.relkind, n.nspname, c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
        ORDER BY CASE WHEN c.relkind IN ('v', 'm') THEN 2 ELSE 1 END
    LOOP
        IF obj.relkind = 'v' THEN
            EXECUTE format(
                'ALTER VIEW %I.%I OWNER TO transcendence_migrator',
                obj.nspname, obj.relname
            );
        ELSIF obj.relkind = 'm' THEN
            EXECUTE format(
                'ALTER MATERIALIZED VIEW %I.%I OWNER TO transcendence_migrator',
                obj.nspname, obj.relname
            );
        ELSIF obj.relkind = 'f' THEN
            EXECUTE format(
                'ALTER FOREIGN TABLE %I.%I OWNER TO transcendence_migrator',
                obj.nspname, obj.relname
            );
        ELSE
            EXECUTE format(
                'ALTER TABLE %I.%I OWNER TO transcendence_migrator',
                obj.nspname, obj.relname
            );
        END IF;
    END LOOP;

    -- Transfer sequences after tables.
    FOR obj IN
        SELECT n.nspname, c.relname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'S'
    LOOP
        EXECUTE format(
            'ALTER SEQUENCE %I.%I OWNER TO transcendence_migrator',
            obj.nspname, obj.relname
        );
    END LOOP;
END
$$;

-- Grant application access to existing business tables and sequences.
GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA public TO transcendence_app;

GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA public TO transcendence_app;

-- Automatically grant application permissions on future objects
-- created by the migrator.
ALTER DEFAULT PRIVILEGES FOR ROLE transcendence_migrator
    IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO transcendence_app;

ALTER DEFAULT PRIVILEGES FOR ROLE transcendence_migrator
    IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO transcendence_app;

-- The application must not modify Prisma migration history.
SELECT format(
    'REVOKE ALL ON TABLE %I.%I FROM %I',
    'public',
    '_prisma_migrations',
    'transcendence_app'
)
WHERE to_regclass('public._prisma_migrations') IS NOT NULL
\gexec
