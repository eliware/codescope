import { createReviewDefaults } from './defaults.mjs';
import { validateReviewOptions } from './options.mjs';

export function resolveReviewOptions(cwd, options = {}) {
  const defaults = createReviewDefaults();
  const resolved = { ...defaults, ...options };
  resolved.openEnvFile ??= defaults.openEnvFile;
  validateReviewOptions(cwd, resolved);
  return resolved;
}
