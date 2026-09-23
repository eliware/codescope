import { runReview } from '../review/lifecycle.mjs';
import { EXIT_CODES } from './errors.mjs';
import { parseArgs } from './args.mjs';
import { dispatchMeta } from './dispatch-meta.mjs';
import { runReviewCommand } from './review-command.mjs';
import { runWithCliErrors } from './error-handler.mjs';
import { createCliRuntimeDefaults } from './runtime-defaults.mjs';

export async function main(
  args,
  options = {},
) {
  const defaults = createCliRuntimeDefaults();
  const {
    output = defaults.output,
    error = defaults.error,
    write = defaults.write,
    cwd = process.cwd(),
    review = runReview,
  } = options;
  return runWithCliErrors(async () => {
    const {
      command,
      mode = 'review',
      option,
      options = [],
      effort,
      model,
      usage,
      dryRun,
      add,
      promptText,
    } = parseArgs(args);
    if (dispatchMeta(command, option, output)) return EXIT_CODES.PASS;
    return await runReviewCommand(command, {
      mode,
      option,
      options,
      effort,
      model,
      usage,
      dryRun,
      add,
      promptText,
      cwd,
      write,
      review,
    });
  }, error);
}
