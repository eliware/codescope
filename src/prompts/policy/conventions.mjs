import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const conventionPolicy = readFileSync(
  fileURLToPath(new URL('./conventions.md', import.meta.url)),
  'utf8',
).trim();
