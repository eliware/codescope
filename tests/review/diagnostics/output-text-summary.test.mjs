import { readOutputTextSummary } from '../../../src/review/diagnostics/output-text-summary.mjs';

test('redacts provider output text for diagnostics', () => {
  expect(readOutputTextSummary({ output_text: 'TOKEN=secret' })).toBe('TOKEN=[REDACTED]');
  expect(readOutputTextSummary({ output_text: 2 })).toBeUndefined();
});
