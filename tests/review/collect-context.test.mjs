import { collectReviewContext } from '../../src/review/collect-context.mjs';

test('delegates repository and test context collection as one phase', async () => {
  const combined = { source: 'context' };
  await expect(
    collectReviewContext({
      cwd: 'repo',
      includesTests: false,
      omitTestResults: false,
      testTimeoutMs: 1,
      runTestCommand: async () => '',
      redactOutput: (value) => value,
      combine: async () => combined,
      readDirectory: async () => [],
      readFile: async () => '',
      maxSourceChars: 10,
    }),
  ).resolves.toEqual({ testResults: undefined, combined });
});
