import { safeResponseSummary } from '../../../src/review/diagnostics/safe-response-summary.mjs';

test('returns a safe summary for provider output', () => {
  expect(safeResponseSummary({ output_text: 'ok' })).toMatchObject({ output_text: 'ok' });
});

test('returns an empty summary when response inspection throws', () => {
  const response = new Proxy({}, { get() { throw new Error('malformed response'); } });
  expect(safeResponseSummary(response)).toEqual({});
});
