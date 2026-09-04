export function validateReviewOptions(
  cwd,
  {
    maxSourceChars,
    testTimeoutMs,
    usage,
    dryRun,
    includesTests,
    omitTestResults,
    write,
    readFile,
    readEnvFile,
    combine,
    runTestCommand,
    redactOutput,
    createClient,
    register,
  },
) {
  if (typeof cwd !== 'string' || !cwd)
    throw new Error('runReview cwd must be a non-empty path string');
  if (!Number.isFinite(maxSourceChars) && maxSourceChars !== Infinity)
    throw new Error('runReview maxSourceChars must be finite or Infinity');
  if (maxSourceChars < 1) throw new Error('runReview maxSourceChars must be positive');
  if (!Number.isFinite(testTimeoutMs) || testTimeoutMs < 1)
    throw new Error('runReview testTimeoutMs must be positive');
  for (const [name, value] of Object.entries({ usage, dryRun, includesTests, omitTestResults }))
    if (value !== undefined && typeof value !== 'boolean')
      throw new Error(`runReview option ${name} must be a boolean`);
  for (const [name, value] of Object.entries({
    write,
    readFile,
    readEnvFile,
    combine,
    runTestCommand,
    redactOutput,
    createClient,
    register,
  }))
    if (typeof value !== 'function') throw new Error(`runReview option ${name} must be a function`);
}
