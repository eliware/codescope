import { resolveReviewOptions } from '../../src/review/resolve-options.mjs';

test('merges defaults and derives the environment reader', () => {
  const readFile = () => {};
  const resolved = resolveReviewOptions('repo', { readFile });
  expect(resolved.readFile).toBe(readFile);
  expect(resolved.readEnvFile).toBe(readFile);
  expect(resolved.testTimeoutMs).toBe(30_000);
});

test('resolves defaults when options are omitted', () => {
  expect(resolveReviewOptions('repo').testTimeoutMs).toBe(30_000);
});

test('preserves an explicitly supplied environment reader', () => {
  const readFile = () => {};
  const readEnvFile = () => {};
  expect(resolveReviewOptions('repo', { readFile, readEnvFile }).readEnvFile).toBe(readEnvFile);
});

test('validates the resolved options before returning them', () => {
  expect(() => resolveReviewOptions('repo', { maxSourceChars: 0 })).toThrow(/positive/);
});
