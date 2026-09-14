import { createReviewDefaults } from './defaults.mjs';
import { validateReviewOptions } from './options.mjs';

export function resolveReviewOptions(cwd, options = {}) {
  const defaults = createReviewDefaults();
  const resolved = { ...defaults, ...options };
  if (typeof resolved.model === 'string') resolved.model = resolved.model.trim();
  resolved.openEnvFile ??= defaults.openEnvFile;
  validateReviewOptions(cwd, resolved);
  return resolved;
}
