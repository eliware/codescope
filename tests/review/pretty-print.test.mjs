import { bestEffortPrettyPrint } from '../../src/review/pretty-print.mjs';

test('pretty-prints valid JSON text', () => {
  expect(bestEffortPrettyPrint('{"ok":true}')).toBe('{\n  "ok": true\n}');
});

test('preserves invalid JSON text inside valid JSON output', () => {
  expect(JSON.parse(bestEffortPrettyPrint('{"ok":'))).toEqual({ raw_response: '{"ok":' });
});

test('pretty-prints response objects', () => {
  expect(bestEffortPrettyPrint({ ok: true })).toBe('{\n  "ok": true\n}');
});

test('preserves output text from unserializable responses', () => {
  const response = { output_text: '{"partial":' };
  response.self = response;
  expect(JSON.parse(bestEffortPrettyPrint(response))).toEqual({ raw_response: '{"partial":' });
});

test('preserves a generic description for unserializable responses without text', () => {
  const response = {};
  response.self = response;
  expect(JSON.parse(bestEffortPrettyPrint(response))).toEqual({ raw_response: '[object Object]' });
});

test('uses a safe marker when response string conversion throws', () => {
  const response = {
    toString: () => {
      throw new Error('unreadable');
    },
  };
  response.self = response;
  expect(JSON.parse(bestEffortPrettyPrint(response))).toEqual({ raw_response: '[unavailable]' });
});
