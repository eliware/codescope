import { runPromptCommand } from '../../src/cli/prompt-command.mjs';

test('runs a custom prompt through the all context without a verdict', async () => {
  const calls = [];
  await expect(
    runPromptCommand({
      cwd: 'repo',
      write: () => {},
      review: async (_cwd, options) => {
        calls.push(options);
        return { raw_response: 'text' };
      },
      promptText: 'summarize',
      effort: 'low',
    }),
  ).resolves.toBe(1);
  expect(calls[0].prompt.reasoning.effort).toBe('low');
  expect(calls[0].plainText).toBe('summarize');
});
