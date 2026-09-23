import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const transportPolicy = readFileSync(
  fileURLToPath(new URL('../../../prompts/policy/transport.md', import.meta.url)),
  'utf8',
).trim();
