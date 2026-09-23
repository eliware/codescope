import { resolveTokenEnvironment } from '../../../src/review/environment/resolve-token-environment.mjs';

test('prefers a nonblank process token', () => {
  expect(resolveTokenEnvironment({ OPENAI_API_TOKEN: 'file' }, { OPENAI_API_TOKEN: ' process ' }))
    .toEqual({ OPENAI_API_TOKEN: 'process' });
});

test('falls back to a file token when the process token is missing or blank', () => {
  expect(resolveTokenEnvironment({ OPENAI_API_TOKEN: 'file' }, {}))
    .toEqual({ OPENAI_API_TOKEN: 'file' });
  expect(resolveTokenEnvironment({ OPENAI_API_TOKEN: 'file' }, { OPENAI_API_TOKEN: '  ' }))
    .toEqual({ OPENAI_API_TOKEN: 'file' });
});

test('falls back to a file token when the process token is not a string', () => {
  expect(resolveTokenEnvironment(
    { OPENAI_API_TOKEN: 'file' },
    { OPENAI_API_TOKEN: 42 },
  )).toEqual({ OPENAI_API_TOKEN: 'file' });
  expect(resolveTokenEnvironment(
    { OPENAI_API_TOKEN: 'file' },
    { OPENAI_API_TOKEN: { trim: 'not a function' } },
  )).toEqual({ OPENAI_API_TOKEN: 'file' });
});

test('returns no token when both sources are missing or blank', () => {
  expect(resolveTokenEnvironment({}, {})).toEqual({});
  expect(resolveTokenEnvironment({ OPENAI_API_TOKEN: '  ' }, { OPENAI_API_TOKEN: '\t' }))
    .toEqual({});
});
