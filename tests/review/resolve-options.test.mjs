import { resolveReviewOptions } from '../../src/review/resolve-options.mjs';

test('merges defaults and preserves the file reader', () => {
  const readFile = () => {};
  const resolved = resolveReviewOptions('repo', { readFile });
  expect(resolved.readFile).toBe(readFile);
});

test('preserves an explicitly supplied file reader', () => {
  const readFile = () => {};
  expect(resolveReviewOptions('repo', { readFile }).readFile).toBe(readFile);
});

test('validates the resolved options before returning them', () => {
  expect(() => resolveReviewOptions('repo', { maxSourceChars: 0 })).toThrow(/positive/);
});

test('rejects surrounding model whitespace before provider setup', () => {
  expect(() => resolveReviewOptions('repo', { model: ' gpt-5.6-luna ' })).toThrow(/Model must/);
});
