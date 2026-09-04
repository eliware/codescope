export async function collectReviewTestEvidence({
  cwd,
  includesTests,
  omitTestResults,
  testTimeoutMs,
  runTestCommand,
  redactOutput,
}) {
  if (!includesTests || omitTestResults) return undefined;
  let testResults;
  try {
    testResults = await runTestCommand(cwd, testTimeoutMs, undefined, redactOutput);
  } catch (cause) {
    testResults = `===== npm test =====\nexit code: unknown\n${redactOutput(String(cause))}`;
  }
  if (typeof testResults !== 'string') throw new Error('Test runner must return a string');
  return testResults;
}
