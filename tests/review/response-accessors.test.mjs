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
