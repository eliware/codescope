import { collectReviewEvidence } from '../../src/review/evidence.mjs';

test('assembles test and source evidence through injected collaborators', async () => {
  const result = await collectReviewEvidence({
    cwd: '.',
    includesTests: false,
    omitTestResults: false,
    testTimeoutMs: 1,
    runTestCommand: async () => '',
    redactOutput: (value) => value,
    combine: async (_cwd, options) => ({ testResults: options.testResults }),
    readDirectory: async () => [],
    readFile: async () => '',
    maxSourceChars: 10,
  });
  expect(result.combined).toEqual({ testResults: undefined });
});
