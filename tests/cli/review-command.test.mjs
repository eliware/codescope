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

