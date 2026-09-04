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
  expect(() => validateReviewOptions('/repo', { ...valid, maxSourceChars: 0 })).toThrow(/maxSourceChars/);
  expect(() => validateReviewOptions('/repo', { ...valid, testTimeoutMs: 0 })).toThrow(/testTimeoutMs/);
  expect(() => validateReviewOptions('/repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('/repo', { ...valid, write: null })).toThrow(/write/);
});
