import { runReviewCommand } from '../../src/cli/review-command.mjs';

test('runs a prompt command without requiring a verdict', async () => {
  await expect(
    runReviewCommand('prompt', {
      cwd: 'repo',
      write: () => {},
      review: async () => ({ raw_response: 'text' }),
      promptText: 'summarize',
    }),
  ).resolves.toBe(0);
});

test('routes review options and status through one command boundary', async () => {
  const calls = [];
  await expect(
    runReviewCommand('analyze-all', {
      cwd: 'repo',
      write: () => {},
      review: async (_cwd, options) => {
        calls.push(options);
        return { verdict: 'pass' };
      },
      effort: 'low',
      testTimeout: '30',
      option: '--usage',
    }),
  ).resolves.toBe(0);
  expect(calls[0]).toMatchObject({ usage: true, testTimeoutMs: 30000 });
});
