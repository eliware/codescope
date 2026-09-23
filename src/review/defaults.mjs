import { prompt as defaultPrompt } from '../prompts/public/review-profiles.mjs';
import { createOutputDefaults } from './defaults/output.mjs';
import { createEnvironmentDefaults } from './defaults/environment.mjs';
import { createProviderDefaults } from './defaults/provider.mjs';
import { createEvidenceDefaults } from './defaults/evidence.mjs';
import { createLifecycleDefaults } from './defaults/lifecycle.mjs';

export function createReviewDefaults({ platform = process.platform } = {}) {
  return {
    ...createOutputDefaults(),
    ...createEnvironmentDefaults(),
    ...createProviderDefaults(),
    ...createEvidenceDefaults(),
    ...createLifecycleDefaults(),
    prompt: defaultPrompt,
    platform,
  };
}
