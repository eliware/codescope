import { runProfileCommand } from '../../src/cli/profile-command.mjs';

test('runs a profile and translates its options', async () => {
  const calls = [];
  await expect(
    runProfileCommand('analyze-all', {
      cwd: 'repo',
      write: () => {},
      review: async (_cwd, options) => {
        calls.push(options);
        return { verdict: 'pass' };
      },
      options: ['--usage'],
      effort: 'low',
      testTimeout: '30',
    }),
  ).resolves.toBe(0);
  expect(calls[0]).toMatchObject({ usage: true, testTimeoutMs: 30000 });
});
