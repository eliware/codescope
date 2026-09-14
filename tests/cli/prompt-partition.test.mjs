import { partitionPromptArgs } from '../../src/cli/prompt-partition.mjs';

test('preserves unknown option-like prompt text and partitions known options', () => {
  expect(partitionPromptArgs(['summarize', '--not-an-option', '--effort=low'])).toEqual({
    promptArgs: ['summarize', '--not-an-option'],
    optionArgs: ['--effort=low'],
  });
});

test('preserves invalid scalar-looking prompt text', () => {
  expect(partitionPromptArgs(['explain', '--effort=details', '--model=custom'])).toEqual({
    promptArgs: ['explain', '--effort=details', '--model=custom'],
    optionArgs: [],
  });
});

test('keeps all text before the delimiter and options after it', () => {
  expect(partitionPromptArgs(['--summarize', 'this', '--', '--effort=low'])).toEqual({
    promptArgs: ['--summarize', 'this'],
    optionArgs: ['--effort=low'],
  });
});

test('rejects non-option tokens after the delimiter with a grammar error', () => {
  expect(() => partitionPromptArgs(['summarize', '--', 'extra'])).toThrow(
    'Only --effort=... or --model=... may follow --',
  );
});

test('normalizes separated trailing scalar options after the delimiter', () => {
  expect(partitionPromptArgs(['summarize', '--', '--effort', 'low', '--model', 'gpt-5.6-sol'])).toEqual({
    promptArgs: ['summarize'],
    optionArgs: ['--effort=low', '--model=gpt-5.6-sol'],
  });
});

test('rejects missing separated trailing scalar values', () => {
  expect(() => partitionPromptArgs(['summarize', '--', '--effort'])).toThrow(
    'Only --effort=... or --model=... may follow --',
  );
});
