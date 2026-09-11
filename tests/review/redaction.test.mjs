import { redactTestOutput } from '../../src/review/redaction.mjs';

test('uses the shared redactor at the CodeScope evidence boundary', () => {
  expect(redactTestOutput('token=secret')).toBe('token=[REDACTED]');
});

test('preserves CodeScope evidence capacity through the generic limit option', () => {
  expect(redactTestOutput('x'.repeat(500_001))).toHaveLength(500_000);
});
