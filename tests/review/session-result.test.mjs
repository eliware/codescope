import { plainTextSessionResult, reviewSessionResult } from '../../src/review/session-result.mjs';

test('preserves plain-text output when usage metadata is unavailable', () => {
  const response = { output_text: '{"ok":true}' };
  Object.defineProperty(response, 'usage', {
    get: () => {
      throw new Error('unavailable');
    },
  });
  expect(plainTextSessionResult(response, true)).toEqual({
    output: { ok: true },
    result: { ok: true, usage: null },
  });
});

test('maps normal review status from the parsed top-level verdict', () => {
  const result = reviewSessionResult(
    { output_text: '{"verdict":"pass"}' },
    {},
    'gpt-5.6-luna',
    false,
    undefined,
    () => ({ verdict: 'pass' }),
  );
  expect(result).toEqual({ verdict: 'pass' });
});
