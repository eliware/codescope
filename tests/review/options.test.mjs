import { validateReviewOptions } from '../../src/review/options.mjs';

const valid = {
  maxSourceChars: 100,
  usage: false,
  dryRun: false,
  omitTestResults: false,
  write: () => {},
  readFile: () => {},
  readEnvFile: () => {},
  combine: () => {},
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
  expect(() => validateReviewOptions('/repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('/repo', { ...valid, write: null })).toThrow(/write/);
});

test('rejects invalid scalar and collaborator options', () => {
  const valid = {
    maxSourceChars: 1,
    write: () => {},
    readFile: () => {},
    readEnvFile: () => {},
    combine: () => {},
    redactOutput: () => {},
    createClient: () => {},
    register: () => {},
  };
  expect(() => validateReviewOptions('repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: 0 })).toThrow(/positive/);
  expect(() => validateReviewOptions('repo', { ...valid, write: null })).toThrow(/write/);
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: Number.NaN })).toThrow(
    /finite/,
  );
  expect(() => validateReviewOptions('', valid)).toThrow(/cwd/);
});
