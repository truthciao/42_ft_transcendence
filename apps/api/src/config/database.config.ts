import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSecret } from '../utils/read-secret.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const env = dotenv.config({
    path: path.resolve(currentDir, '../.env'),
});

dotenvExpand.expand(env);

export type DatabaseRole = 'migrator' | 'app';

export function getDatabaseUrl(role: DatabaseRole): string {
    const envName =
        role === 'app'
            ? 'DATABASE_URL_APP_LOCAL'
            : 'DATABASE_URL_MIGRATOR_LOCAL';

    const fileEnvName =
        role === 'app'
            ? 'DATABASE_URL_APP_SECRET_FILE'
            : 'DATABASE_URL_MIGRATOR_SECRET_FILE';

    return getSecret(envName, fileEnvName);
}