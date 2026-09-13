import { validatePromptShape } from './prompt-shape.mjs';

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
    inspectFile,
    inspectPermissions,
    platform,
    envFile,
    prompt,
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
  for (const [name, value] of Object.entries({ inspectFile, inspectPermissions }))
    if (value !== undefined && typeof value !== 'function')
      throw new Error(`runReview option ${name} must be a function`);
  if (prompt !== undefined) validatePromptShape(prompt);
  if (validatePermissions !== false && typeof inspectPermissions !== 'function')
    throw new Error('runReview option inspectPermissions must be a function when permission validation is enabled');
  if (envFile !== undefined && (typeof envFile !== 'string' || !envFile))
    throw new Error('runReview option envFile must be a non-empty string');
  if (platform !== undefined && !['linux', 'darwin', 'freebsd', 'win32'].includes(platform))
    throw new Error(`runReview option platform is unsupported: ${platform}`);
}
