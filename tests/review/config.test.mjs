import os from 'node:os';
import path from 'node:path';
import { defaultEnvFile, loadEnv } from '../../src/review/config.mjs';

test('resolves the default config below the user home directory', () => {
  expect(defaultEnvFile()).toBe(path.join(os.homedir(), '.codescope'));
});

test('accepts omitted dotenv text', () => {
  expect(() => loadEnv(undefined, {})).not.toThrow();
});

test('rejects invalid environment containers', () => {
  expect(() => loadEnv('OPENAI_API_TOKEN=token-placeholder', null)).toThrow(/mutable object/);
  expect(() => loadEnv('OPENAI_API_TOKEN=token-placeholder', [])).toThrow(/mutable object/);
});

test('loads the supported token assignment', () => {
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=token-placeholder', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('token-placeholder');
});

test('loads supported dotenv syntax and only the API token', () => {
  const environment = {};
  loadEnv(
    [
      '# comment',
      ' export OPENAI_API_TOKEN = "line\\n tab\\t quote\\" slash\\\\"',
      "IGNORED='value'",
      'EMPTY=   ',
      'OTHER=plain # comment',
      "SINGLE='it\\'s fine'",
    ].join('\n'),
    environment,
  );
  expect(environment.OPENAI_API_TOKEN).toBe('line\n tab\t quote" slash\\');
  expect(environment.IGNORED).toBeUndefined();
});

test('allows a later usable token after a blank duplicate assignment', () => {
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=\nOPENAI_API_TOKEN=token-placeholder', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('token-placeholder');
});

test('handles duplicates and pre-existing environment values', () => {
  const environment = { OPENAI_API_TOKEN: 'already' };
  loadEnv('OPENAI_API_TOKEN=ignored\nOPENAI_API_TOKEN=also-ignored', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('already');
  const second = {};
  loadEnv('OPENAI_API_TOKEN=first\nOPENAI_API_TOKEN=second', second);
  expect(second.OPENAI_API_TOKEN).toBe('first');
});

test('rejects malformed lines and quoted values', () => {
  for (const value of ['"unterminated', "'unterminated", '"bad"tail'])
    expect(() => loadEnv(`OPENAI_API_TOKEN=${value}`, {})).toThrow(/Invalid quoted/);
  expect(() => loadEnv('not dotenv', {})).toThrow('Invalid .env line');
  expect(() => loadEnv('OPENAI_API_TOKEN=', {})).not.toThrow();
  expect(() => loadEnv('OPENAI_API_TOKEN=""', {})).not.toThrow();
  expect(() => loadEnv("OPENAI_API_TOKEN=''", {})).not.toThrow();
});

test('ignores empty values and unrelated variables', () => {
  const environment = {};
  loadEnv('OPENAI_API_TOKEN=\nOTHER=value', environment);
  expect(environment).toEqual({});
});
