import process from 'node:process';
import { validateReviewScalars } from './options/validate-scalars.mjs';
import { validateReviewCollaborators } from './options/validate-collaborators.mjs';
import { validateReviewPlatform } from './options/validate-platform.mjs';

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
  validateReviewPlatform({ cwd, envFile, platform, environment });
  validateReviewScalars({ maxSourceChars, model, plainText, add, usage, dryRun, prompt });
  validateReviewCollaborators({ write, readFile, combine, createClient, register, openEnvFile, inspectFile });
}
