import { readFileSync } from 'node:fs';

export function readSecretFile(path: string | undefined): string {
  if (!path) {
    throw new Error('Secret file path is not configured');
  }

  const secret = readFileSync(path, 'utf8').trim();

  if (!secret) {
    throw new Error('Secret file is empty');
  }

  return secret;
}
