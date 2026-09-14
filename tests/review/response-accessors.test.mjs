import { readNumericUsage, readStringProperty } from '../../src/review/response-accessors.mjs';

test('safely reads throwing optional provider fields', () => {
  const response = {};
  Object.defineProperty(response, 'output_text', {
    get: () => {
      throw new Error('bad');
    },
  });
  Object.defineProperty(response, 'usage', {
    get: () => {
      throw new Error('bad');
    },
  });
  expect(readStringProperty(response, 'output_text')).toBeUndefined();
  expect(readNumericUsage(response)).toBeUndefined();
});

test('marks malformed numeric usage fields in safe diagnostics', () => {
  expect(readNumericUsage({ usage: { input_tokens: 2, output_tokens: -1, note: 'bad' } }))
    .toEqual({ input_tokens: 2, invalid_fields: true });
});
