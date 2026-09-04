import { usage } from '../../src/cli/help.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('prints the quick-start document as the help message', () => {
  const quickStart = readFileSync(
    fileURLToPath(new URL('../../docs/quick-start.md', import.meta.url)),
    'utf8',
  );
  expect(usage()).toBe(quickStart);
});
