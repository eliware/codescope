import { finalizeReviewSession } from '../finalize-session.mjs';
import { runReviewSession } from '../run-session.mjs';

export async function executeRequest({ client, request, controller, options }) {
  const session = await finalizeReviewSession({
    register: options.register,
    controller,
    execute: (signal) => runReviewSession({ client, request, signal, write: options.write, dryRun: options.dryRun, usage: options.usage, plainText: options.plainText }),
  });
  return session.output;
}
