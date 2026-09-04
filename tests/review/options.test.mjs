import { validateReviewOptions } from '../../src/review/options.mjs';

const valid = {
  maxSourceChars: 100,
  testTimeoutMs: 100,
  usage: false,
  dryRun: false,
  includesTests: false,
  omitTestResults: false,
  write: () => {},
  readFile: () => {},
  readEnvFile: () => {},
  combine: () => {},
  runTestCommand: () => {},
  redactOutput: () => {},
  createClient: () => {},
  register: () => {},
};

test('accepts valid review options', () => {
  expect(() => validateReviewOptions('/repo', valid)).not.toThrow();
});

test('rejects invalid review options', () => {
  expect(() => validateReviewOptions('', valid)).toThrow(/cwd/);
  expect(() => validateReviewOptions('/repo', { ...valid, maxSourceChars: 0 })).toThrow(
    /maxSourceChars/,
  );
  expect(() => validateReviewOptions('/repo', { ...valid, testTimeoutMs: 0 })).toThrow(
    /testTimeoutMs/,
  );
  expect(() => validateReviewOptions('/repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('/repo', { ...valid, write: null })).toThrow(/write/);
});

test('rejects invalid scalar and collaborator options', () => {
  const valid = {
    maxSourceChars: 1,
    testTimeoutMs: 1,
    write: () => {},
    readFile: () => {},
    readEnvFile: () => {},
    combine: () => {},
    runTestCommand: () => {},
    redactOutput: () => {},
    createClient: () => {},
    register: () => {},
  };
  expect(() => validateReviewOptions('repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: 0 })).toThrow(/positive/);
  expect(() => validateReviewOptions('repo', { ...valid, testTimeoutMs: 0 })).toThrow(/positive/);
  expect(() => validateReviewOptions('repo', { ...valid, write: null })).toThrow(/write/);
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: Number.NaN })).toThrow(
    /finite/,
  );
  expect(() => validateReviewOptions('', valid)).toThrow(/cwd/);
});
