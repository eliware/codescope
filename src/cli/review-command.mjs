import { runPromptCommand } from './prompt-command.mjs';
import { runProfileCommand } from './profile-command.mjs';

export async function runReviewCommand(
  command,
  {
    mode = 'review',
    option,
    options = [],
    testTimeout,
    effort,
    model,
    dryRun,
    promptText,
    cwd,
    write,
    review,
  },
) {
  if (command === 'prompt')
    return runPromptCommand({ cwd, write, review, promptText, model, effort });
  return runProfileCommand(command, {
    mode,
    option,
    options,
    testTimeout,
    effort,
    model,
    dryRun,
    cwd,
    write,
    review,
  });
}
