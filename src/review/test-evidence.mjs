import { formatTestFailure } from './test-evidence-format.mjs';

export async function collectReviewTestEvidence({
  cwd,
  includesTests,
  omitTestResults,
  testTimeoutMs,
  runTestCommand,
  redactOutput,
  platform,
}) {
  if (!includesTests || omitTestResults) return undefined;
  let testResults;
  try {
    testResults = await runTestCommand(cwd, testTimeoutMs, undefined, redactOutput, platform);
  } catch (cause) {
    testResults = formatTestFailure(cause, testTimeoutMs, redactOutput);
  }
  if (typeof testResults !== 'string') throw new Error('Test runner must return a string');
  return testResults;
}
