import { parsePlainTextJsonResponse } from '../../src/review/plain-text-response.mjs';

test('preserves invalid custom response text', () => {
  expect(parsePlainTextJsonResponse({ output_text: 'not json' })).toEqual({
    raw_response: 'not json',
  });
});
