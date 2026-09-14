import { runReview } from '../review/lifecycle.mjs';
import { EXIT_CODES } from './errors.mjs';
import { parseArgs } from './args.mjs';
import { dispatchMeta } from './dispatch-meta.mjs';
import { runReviewCommand } from './review-command.mjs';
import { runWithCliErrors } from './error-handler.mjs';

export async function main(
  args,
  {
    output = console.log,
    error = console.error,
    write = (value) => {
      process.stdout.write(value);
      return { written: value.length };
    },
    cwd = process.cwd(),
    review = runReview,
  } = {},
) {
  return runWithCliErrors(async () => {
    const {
      command,
      mode = 'review',
      option,
      options = [],
      effort,
      model,
      dryRun,
      add = [],
      promptText,
    } = parseArgs(args);
    if (dispatchMeta(command, option, output, add)) return EXIT_CODES.PASS;
    return await runReviewCommand(command, {
      mode,
      option,
      options,
      effort,
      model,
      dryRun,
      add,
      promptText,
      cwd,
      write,
      review,
    });
  }, error);
}
