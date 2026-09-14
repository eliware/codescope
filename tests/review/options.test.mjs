import { validateReviewOptions } from '../../src/review/options.mjs';

const valid = {
  maxSourceChars: 100,
  usage: false,
  dryRun: false,
  write: () => {},
  readFile: () => {},
  readEnvFile: () => {},
  combine: () => {},
  createClient: () => {},
  register: () => {},
  platform: 'linux',
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
  expect(() => validateReviewOptions('/repo', { ...valid, openEnvFile: null })).toThrow(/openEnvFile/);
  expect(() => validateReviewOptions('/repo', { ...valid, platform: 'plan9' })).toThrow(/unsupported/);
});

test('rejects invalid scalar and collaborator options', () => {
  const valid = {
    maxSourceChars: 1,
    write: () => {},
    readFile: () => {},
    readEnvFile: () => {},
    combine: () => {},
    createClient: () => {},
    register: () => {},
    platform: 'linux',
  };
  expect(() => validateReviewOptions('repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: 0 })).toThrow(/positive/);
  expect(() => validateReviewOptions('repo', { ...valid, write: null })).toThrow(/write/);
  expect(() => validateReviewOptions('repo', { ...valid, inspectFile: null })).toThrow(/inspectFile/);
  expect(() => validateReviewOptions('repo', { ...valid, prompt: 'prompt' })).toThrow(/Prompt/);
  expect(() => validateReviewOptions('repo', { ...valid, prompt: [] })).toThrow(/Prompt/);
  expect(() => validateReviewOptions('repo', { ...valid, prompt: { input: [] } })).toThrow(/developer/);
  expect(() => validateReviewOptions('repo', { ...valid, envFile: '' })).toThrow(/envFile/);
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: Number.NaN })).toThrow(
    /positive integer or Infinity/,
  );
  expect(() => validateReviewOptions('repo', { ...valid, maxSourceChars: 1.5 })).toThrow(
    /positive integer or Infinity/,
  );
  expect(() => validateReviewOptions('', valid)).toThrow(/cwd/);
});
