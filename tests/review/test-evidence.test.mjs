import { collectReviewTestEvidence } from '../../src/review/test-evidence.mjs';

const base = {
  cwd: '/repo',
  testTimeoutMs: 100,
  runTestCommand: async () => 'test output',
  redactOutput: (value) => value,
};

test('skips test execution when tests are not included', async () => {
  await expect(
    collectReviewTestEvidence({
      ...base,
      includesTests: false,
      runTestCommand: () => {
        throw new Error('unexpected');
      },
    }),
  ).resolves.toBeUndefined();
});

test('returns successful test output', async () => {
  await expect(
    collectReviewTestEvidence({ ...base, includesTests: true, omitTestResults: false }),
  ).resolves.toBe('test output');
});

test('formats runner failures and rejects invalid runner output', async () => {
  await expect(
    collectReviewTestEvidence({
      ...base,
      includesTests: true,
      omitTestResults: false,
      runTestCommand: async () => {
        throw new Error('failed');
      },
    }),
  ).resolves.toContain('failed');
  await expect(
    collectReviewTestEvidence({
      ...base,
      includesTests: true,
      omitTestResults: false,
      runTestCommand: async () => 42,
    }),
  ).rejects.toThrow('string');
});
