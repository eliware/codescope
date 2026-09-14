import { runPromptCommand } from './prompt-command.mjs';
import { runProfileCommand } from './profile-command.mjs';

export async function runReviewCommand(
  command,
  {
    mode = 'review',
    option,
    options = [],
    effort,
    model,
    usage,
    dryRun,
    promptText,
    add,
    cwd,
    write,
    review,
  },
) {
  if (command === 'prompt')
    return runPromptCommand({ cwd, write, review, promptText, model, effort, add });
  return runProfileCommand(command, {
    mode,
    option,
    options,
    effort,
    model,
    usage,
    dryRun,
    cwd,
    write,
    review,
    add,
  });
}
