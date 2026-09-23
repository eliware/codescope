import { prompt as defaultPrompt } from '../prompts/public/focused-review-profiles.mjs';
import { createOutputDefaults } from './defaults/output.mjs';
import { createEnvironmentDefaults } from './defaults/environment.mjs';
import { createProviderDefaults } from './defaults/provider.mjs';
import { createEvidenceDefaults } from './defaults/evidence.mjs';
import { createLifecycleDefaults } from './defaults/lifecycle.mjs';
import { validateReviewOptions } from './options/validate-all.mjs';

export function resolveReviewOptions(cwd, options = {}) {
  const defaults = {
    ...createOutputDefaults(),
    ...createEnvironmentDefaults(),
    ...createProviderDefaults(),
    ...createEvidenceDefaults(),
    ...createLifecycleDefaults(),
    prompt: defaultPrompt,
    platform: process.platform,
  };
  const resolved = { ...defaults, ...options };
  resolved.openEnvFile ??= defaults.openEnvFile;
  validateReviewOptions(cwd, resolved);
  return resolved;
}
