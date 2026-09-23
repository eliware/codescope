import { isPromptScalarOption } from '../../../src/cli/options/prompt-values.mjs';

test('recognizes valid prompt scalar options', () => {
  expect(isPromptScalarOption('--effort=low')).toBe(true);
  expect(isPromptScalarOption('--model=gpt-5.6-sol')).toBe(true);
});

test('rejects invalid or unrelated prompt values', () => {
  expect(isPromptScalarOption('--effort=invalid')).toBe(false);
  expect(isPromptScalarOption('plain text')).toBe(false);
});
