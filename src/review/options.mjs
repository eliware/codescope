export function validateReviewOptions(
  cwd,
  {
    maxSourceChars,
    usage,
    dryRun,
    write,
    readFile,
    readEnvFile,
    combine,
    createClient,
    register,
    validatePermissions,
  },
) {
  if (typeof cwd !== 'string' || !cwd)
    throw new Error('runReview cwd must be a non-empty path string');
  if (!Number.isFinite(maxSourceChars) && maxSourceChars !== Infinity)
    throw new Error('runReview maxSourceChars must be finite or Infinity');
  if (maxSourceChars < 1) throw new Error('runReview maxSourceChars must be positive');
  for (const [name, value] of Object.entries({ usage, dryRun, validatePermissions }))
    if (value !== undefined && typeof value !== 'boolean')
      throw new Error(`runReview option ${name} must be a boolean`);
  for (const [name, value] of Object.entries({
    write,
    readFile,
    readEnvFile,
    combine,
    createClient,
    register,
  }))
    if (typeof value !== 'function') throw new Error(`runReview option ${name} must be a function`);
}
