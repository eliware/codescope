import { validateReviewOptions } from '../../src/review/options.mjs';

const valid = {
  maxSourceChars: 100,
  usage: false,
  dryRun: false,
  write: () => {},
  readFile: () => {},
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
  expect(() => validateReviewOptions('/repo', { ...valid, maxSourceChars: Number.NEGATIVE_INFINITY })).toThrow(
    /positive integer or Infinity/,
  );
  expect(() => validateReviewOptions('/repo', { ...valid, usage: 'yes' })).toThrow(/usage/);
  expect(() => validateReviewOptions('/repo', { ...valid, write: null })).toThrow(/write/);
  expect(() => validateReviewOptions('/repo', { ...valid, openEnvFile: null })).toThrow(/openEnvFile/);
  expect(() => validateReviewOptions('/repo', { ...valid, platform: 'plan9' })).toThrow(/unsupported/);
  expect(() => validateReviewOptions('/repo', { ...valid, plainText: ' ' })).toThrow(/plainText/);
  expect(() => validateReviewOptions('/repo', { ...valid, add: ['ok', 1] })).toThrow(/add/);
  expect(() => validateReviewOptions('/repo', { ...valid, add: [' '] })).toThrow(/add/);
  expect(() => validateReviewOptions('/repo', { ...valid, model: 42 })).toThrow(/model/);
  expect(() => validateReviewOptions('/repo', { ...valid, model: ' ' })).toThrow(/model/);
  expect(() => validateReviewOptions('/repo', { ...valid, model: 'unsupported-model' })).toThrow(/Model must/);
  expect(() => validateReviewOptions('/repo', { ...valid, model: ' gpt-5.6-luna ' })).not.toThrow();
  expect(() => validateReviewOptions('/repo', { ...valid, environment: null })).toThrow(/environment/);
  expect(() => validateReviewOptions('/repo', { ...valid, environment: [] })).toThrow(/environment/);
  expect(() => validateReviewOptions('/repo', { ...valid, plainText: 'prompt', dryRun: true })).toThrow(
    /cannot be combined/,
  );
});

test('rejects invalid scalar and collaborator options', () => {
  const valid = {
    maxSourceChars: 1,
    write: () => {},
    readFile: () => {},
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
