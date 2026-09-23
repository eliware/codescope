import { loadEnv } from '../../src/review/dotenv-parser.mjs';

test('loads the supported token from dotenv text', () => {
  const environment = {};
  loadEnv('export OPENAI_API_TOKEN="secret"', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('secret');
});

test('ignores comments, blanks, and already-populated values', () => {
  const environment = { OPENAI_API_TOKEN: 'existing' };
  loadEnv('\n# comment\nOPENAI_API_TOKEN=ignored\nOTHER=value\nlowercase=value\nMixed_Name=value', environment);
  expect(environment).toEqual({ OPENAI_API_TOKEN: 'existing' });
});

test('decodes quoted values and inline comments', () => {
  const environment = {};
  loadEnv('OPENAI_API_TOKEN="line\\nnext\\tvalue"', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('line\nnext\tvalue');
  loadEnv("OPENAI_API_TOKEN='secret'", {});
  loadEnv('OPENAI_API_TOKEN=secret # ignored', {});
});

test('rejects malformed dotenv input', () => {
  expect(() => loadEnv('not dotenv', {})).toThrow(/Invalid \.env line/);
  expect(() => loadEnv('OPENAI_API_TOKEN="unterminated', {})).toThrow(/Invalid quoted/);
  expect(() => loadEnv("OPENAI_API_TOKEN='unterminated", {})).toThrow(/Invalid quoted/);
});

test('rejects immutable environment shapes and ignores empty values', () => {
  expect(() => loadEnv(undefined, {})).not.toThrow();
  expect(() => loadEnv('', null)).toThrow(/mutable object/);
  expect(() => loadEnv('', [])).toThrow(/mutable object/);
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=""\nOPENAI_API_TOKEN=   ', environment);
  expect(environment).toEqual({});
});
