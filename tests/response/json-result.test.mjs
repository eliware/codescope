import { parseJsonResult } from '../../src/response/json-result.mjs';

test('parses object JSON and preserves invalid output', () => {
  expect(parseJsonResult('{"ok":true}')).toEqual({ ok: true });
  expect(parseJsonResult('invalid')).toEqual({ raw_response: 'invalid', verdict: 'block' });
});
