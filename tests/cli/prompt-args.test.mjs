import { parsePromptArgs } from '../../src/cli/prompt-args.mjs';

test('parses prompt text with supported model and effort options', () => {
  expect(parsePromptArgs(['review', 'risks', '--effort=low', '--model=gpt-5.6-sol'])).toEqual({
    command: 'prompt',
    promptText: 'review risks',
    effort: 'low',
    model: 'gpt-5.6-sol',
    add: [],
  });
});

test('supports a delimiter for dash-leading prompt text', () => {
  expect(parsePromptArgs(['--summarize', 'this', '--', '--effort=low'])).toEqual({
    command: 'prompt',
    promptText: '--summarize this',
    effort: 'low',
    model: undefined,
    add: [],
  });
});

test('rejects additions after the prompt delimiter', () => {
  expect(() => parsePromptArgs(['question', '--', '--add', 'note'])).toThrow(
    'Only --effort=... or --model=... may follow --',
  );
});

test('rejects missing, duplicate, and invalid prompt options', () => {
  expect(() => parsePromptArgs([])).toThrow(/prompt/);
  expect(() => parsePromptArgs(['x', '--effort=low', '--effort=high'])).toThrow(/Only one/);
  expect(() => parsePromptArgs(['x', '--model=gpt-5.6-sol', '--model=gpt-5.6-luna'])).toThrow(
    /Only one/,
  );
  expect(parsePromptArgs(['x', '--effort=bad']).promptText).toContain('--effort=bad');
  expect(parsePromptArgs(['x', '--model=bad']).promptText).toContain('--model=bad');
  expect(() => parsePromptArgs(['x', '--usage'])).toThrow(/Usage/);
  expect(() => parsePromptArgs(['x', '--dry-run'])).toThrow(/Usage/);
});
