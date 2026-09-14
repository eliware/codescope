import { redactDiagnostic, redactTestOutput } from '../../src/review/redaction.mjs';

test('uses the shared redactor at the CodeScope evidence boundary', () => {
  expect(redactTestOutput('token=secret')).toBe('token=[REDACTED]');
});

test('preserves CodeScope evidence capacity through the generic limit option', () => {
  expect(redactTestOutput('x'.repeat(500_001))).toHaveLength(500_000);
});

test('normalizes non-string diagnostics before redaction', () => {
  expect(redactDiagnostic(null)).toEqual({ text: '', truncated: false });
  expect(redactDiagnostic(42)).toEqual({ text: '42', truncated: false });
});

test('reports diagnostic truncation from the original value length', () => {
  expect(redactDiagnostic('x'.repeat(500_001)).truncated).toBe(true);
});
