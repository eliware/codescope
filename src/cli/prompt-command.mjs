import { getProfile } from '../profiles/index.mjs';
import { statusForPromptResult } from './status-result.mjs';
import { applyEffort } from './prompt-options.mjs';

export async function runPromptCommand({ cwd, write, review, promptText, model, effort }) {
  const { combine, prompt: profilePrompt } = getProfile('all', 'review');
  const prompt = applyEffort(profilePrompt, effort);
  const result = await review(cwd, { combine, prompt, plainText: promptText, model, write });
  return statusForPromptResult(result);
}
