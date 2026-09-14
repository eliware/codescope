import process from 'node:process';
import { validatePromptShape } from './prompt-shape.mjs';

export function validateReviewOptions(
  cwd,
  {
    maxSourceChars,
    model,
    plainText,
    add,
    usage,
    dryRun,
    write,
    readFile,
    openEnvFile,
    combine,
    createClient,
    register,
    inspectFile,
    platform,
    envFile,
    environment = process.env,
    prompt,
  },
) {
  if (typeof cwd !== 'string' || !cwd)
    throw new Error('runReview cwd must be a non-empty path string');
  if (maxSourceChars !== Infinity && (!Number.isFinite(maxSourceChars) || !Number.isInteger(maxSourceChars) || maxSourceChars < 1))
    throw new Error('runReview maxSourceChars must be a positive integer or Infinity');
  if (model !== undefined && (typeof model !== 'string' || !model.trim()))
    throw new Error('runReview option model must be a non-empty string');
  if (plainText !== undefined && (typeof plainText !== 'string' || !plainText.trim()))
    throw new Error('runReview option plainText must be a non-empty string');
  if (add !== undefined && (!Array.isArray(add) || !add.every((value) => typeof value === 'string' && value.trim())))
    throw new Error('runReview option add must be an array of strings');
  if (plainText !== undefined && (dryRun || usage))
    throw new Error('runReview option plainText cannot be combined with dryRun or usage');
  for (const [name, value] of Object.entries({ usage, dryRun }))
    if (value !== undefined && typeof value !== 'boolean')
      throw new Error(`runReview option ${name} must be a boolean`);
  for (const [name, value] of Object.entries({
    write,
    readFile,
    combine,
    createClient,
    register,
  }))
    if (typeof value !== 'function') throw new Error(`runReview option ${name} must be a function`);
  if (openEnvFile !== undefined && typeof openEnvFile !== 'function')
    throw new Error('runReview option openEnvFile must be a function');
  for (const [name, value] of Object.entries({ inspectFile }))
    if (value !== undefined && typeof value !== 'function')
      throw new Error(`runReview option ${name} must be a function`);
  if (prompt !== undefined) validatePromptShape(prompt);
  if (envFile !== undefined && (typeof envFile !== 'string' || !envFile))
    throw new Error('runReview option envFile must be a non-empty string');
  if (platform !== undefined && !['linux', 'darwin', 'freebsd', 'win32'].includes(platform))
    throw new Error(`runReview option platform is unsupported: ${platform}`);
  if (!environment || typeof environment !== 'object' || Array.isArray(environment))
    throw new Error('runReview option environment must be an object');
}
