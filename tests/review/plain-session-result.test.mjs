import { plainTextSessionResult } from '../../src/review/plain-session-result.mjs';

test('creates a plain session result', () => {
  expect(plainTextSessionResult({ output_text: '{"ok":true}' }, false).result).toEqual({
    ok: true,
  });
});
