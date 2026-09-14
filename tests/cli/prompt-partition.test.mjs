import { partitionPromptArgs } from '../../src/cli/prompt-partition.mjs';

test('preserves unknown option-like prompt text and partitions known options', () => {
  expect(partitionPromptArgs(['summarize', '--not-an-option', '--effort=low'])).toEqual({
    promptArgs: ['summarize', '--not-an-option'],
    optionArgs: ['--effort=low'],
  });
});

test('keeps all text before the delimiter and options after it', () => {
  expect(partitionPromptArgs(['--summarize', 'this', '--', '--effort=low'])).toEqual({
    promptArgs: ['--summarize', 'this'],
    optionArgs: ['--effort=low'],
  });
});
