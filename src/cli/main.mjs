import { runReview } from '../review/lifecycle.mjs';
import { EXIT_CODES, errorExitCode } from './errors.mjs';
import { parseArgs } from './args.mjs';
import { dispatchMeta } from './dispatch-meta.mjs';
import { runReviewCommand } from './review-command.mjs';

export async function main(
  args,
  {
    output = console.log,
    error = console.error,
    write = process.stdout.write.bind(process.stdout),
    cwd = process.cwd(),
    review = runReview,
  } = {},
) {
  try {
    const {
      command,
      mode = 'review',
      option,
      options = [],
      testTimeout,
      effort,
      model,
      dryRun,
      promptText,
    } = parseArgs(args);
    if (dispatchMeta(command, option, output)) return EXIT_CODES.PASS;
    return await runReviewCommand(command, {
      mode,
      option,
      options,
      testTimeout,
      effort,
      model,
      dryRun,
      promptText,
      cwd,
      write,
      review,
    });
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    if (cause instanceof Error && cause.message.startsWith('Unknown command'))
      error('Run "codescope --help" for usage.');
    return errorExitCode(cause);
  }
}
