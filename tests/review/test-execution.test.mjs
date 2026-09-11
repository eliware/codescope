import { executeNpmTest } from '../../src/review/test-execution.mjs';

test('executes the first available npm command', async () => {
  await expect(
    executeNpmTest('repo', 100, async () => ({ code: 0 }), 'linux', {}),
  ).resolves.toEqual({ code: 0 });
});
