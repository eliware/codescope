import { getProfile } from '../profiles/index.mjs';
import { applyEffort } from './prompt-options.mjs';

export async function runPromptCommand({ cwd, write, review, promptText, model, effort }) {
  const { combine, prompt: profilePrompt } = getProfile('all', 'review');
  const prompt = applyEffort(profilePrompt, effort);
  await review(cwd, { combine, prompt, plainText: promptText, model, write });
  return 0;
}
