import { collectReviewContext } from './collect-context.mjs';
import { createReviewSession } from './create-session.mjs';
import { finalizeReviewSession } from './finalize-session.mjs';
import { prepareReview } from './prepare-review.mjs';
import { runReviewSession } from './run-session.mjs';
import { createIncompleteResult, createProviderFailure } from './failure.mjs';
import { writeFallbackResult } from './output.mjs';

export async function runReviewPipeline(cwd, options) {
  const { combined } = await collectReviewContext({
    cwd,
    combine: options.combine,
    readDirectory: options.readDirectory,
    readFile: options.readFile,
    maxSourceChars: options.maxSourceChars,
    platform: options.platform,
  });
  let client;
  try {
    ({ client } = await prepareReview({
      envFile: options.envFile,
      readFile: options.readFile,
      readEnvFile: options.readEnvFile,
      openEnvFile: options.openEnvFile,
      inspectFile: options.inspectFile,
      createClient: options.createClient,
    }));
  } catch (cause) {
    const result = createIncompleteResult(cause);
    const failure = createProviderFailure(cause);
    failure.result = result;
    const fallbackError = await writeFallbackResult(options.write, result);
    if (fallbackError) failure.fallbackError = fallbackError;
    throw failure;
  }
  const { request, controller } = createReviewSession({
    prompt: options.prompt,
    combined,
    model: options.model,
    plainText: options.plainText,
    add: options.add,
  });
  const session = await finalizeReviewSession({
    register: options.register,
    controller,
    execute: (signal) =>
      runReviewSession({
        client,
        request,
        signal,
        write: options.write,
        dryRun: options.dryRun,
        usage: options.usage,
        plainText: options.plainText,
      }),
  });
  return session.output;
}
