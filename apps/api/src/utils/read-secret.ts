import { readFileSync } from 'node:fs';

export function getSecret(
    envName: string,
    fileEnvName: string,
): string {
    const secretFile = process.env[fileEnvName];

    if (secretFile) {
        const secret = readFileSync(secretFile, 'utf8').trim();

        if (!secret) {
            throw new Error(`${fileEnvName} points to an empty secret file`);
        }

        return secret;
    }

    const secret = process.env[envName]?.trim();

    if (!secret) {
        throw new Error(`${envName} is not defined`);
    }

    return secret;
}