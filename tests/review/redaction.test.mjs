import { redactTestOutput } from '../../src/review/redaction.mjs';

test('redacts common credentials and private keys', () => {
  const output = redactTestOutput(
    'token=secret sk-test123 Bearer abc password: "pw" -----BEGIN KEY-----x-----END KEY-----',
  );
  expect(output).not.toContain('secret');
  expect(output).not.toContain('sk-test123');
  expect(output).not.toContain('Bearer abc');
  expect(output).toContain('[redacted-private-key]');
});

test('normalizes missing values and limits output size', () => {
  expect(redactTestOutput()).toBe('');
  expect(redactTestOutput('x'.repeat(500_001))).toHaveLength(500_000);
});
