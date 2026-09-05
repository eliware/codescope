import { createReviewDefaults } from './defaults.mjs';
import { validateReviewOptions } from './options.mjs';

export function resolveReviewOptions(cwd, options = {}) {
  const resolved = { ...createReviewDefaults(), ...options };
  resolved.readEnvFile ??= resolved.readFile;
  resolved.redactOutput ??= resolved.redactTestOutput;
  validateReviewOptions(cwd, resolved);
  return resolved;
}
