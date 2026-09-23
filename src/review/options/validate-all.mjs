import process from 'node:process';
import { validateReviewScalars } from './validate-scalars.mjs';
import { validateReviewCollaborators } from './validate-collaborators.mjs';
import { validateReviewPlatform } from './validate-platform.mjs';

export function validateReviewOptions(cwd, {
  maxSourceChars, model, plainText, add, usage, dryRun, write, readFile, openEnvFile,
  combine, createClient, register, inspectFile, platform, envFile,
  environment = process.env, prompt,
}) {
  validateReviewPlatform({ cwd, envFile, platform, environment });
  validateReviewScalars({ maxSourceChars, model, plainText, add, usage, dryRun, prompt });
  validateReviewCollaborators({ write, readFile, combine, createClient, register, openEnvFile, inspectFile });
}
