import { parsePromptArgs } from '../../src/cli/prompt-args.mjs';

test('parses prompt text with supported model and effort options', () => {
  expect(parsePromptArgs(['review', 'risks', '--effort=low', '--model=gpt-5.6-sol'])).toEqual({
    command: 'prompt',
    promptText: 'review risks',
    effort: 'low',
    model: 'gpt-5.6-sol',
  });
});

test('rejects missing, duplicate, and invalid prompt options', () => {
  expect(() => parsePromptArgs([])).toThrow(/prompt/);
  expect(() => parsePromptArgs(['x', '--effort=low', '--effort=low'])).toThrow(/Usage/);
  expect(() => parsePromptArgs(['x', '--effort=bad'])).toThrow(/Effort/);
  expect(() => parsePromptArgs(['x', '--model=bad'])).toThrow(/Model/);
  expect(() => parsePromptArgs(['x', '--usage'])).toThrow(/Usage/);
});
