import { createSessionResult } from '../../src/review/session-result.mjs';

test('creates a common dry-run session result shape', () => {
  expect(createSessionResult('dry-run', { estimated_input_tokens: 1 })).toEqual({
    kind: 'dry-run',
    output: { estimated_input_tokens: 1 },
  });
});

test('creates a common provider session result shape', () => {
  const response = { output_text: 'ok' };
  expect(createSessionResult('review', 'ok', response)).toEqual({
    kind: 'review',
    output: 'ok',
    providerResponse: response,
  });
});
