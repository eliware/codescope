import { resolveTokenEnvironment } from '../../../src/review/environment/resolve-token-environment.mjs';

test('prefers a nonblank process token', () => {
  expect(resolveTokenEnvironment({ OPENAI_API_TOKEN: 'file' }, { OPENAI_API_TOKEN: ' process ' }))
    .toEqual({ OPENAI_API_TOKEN: 'process' });
});
