import { collectReviewContext } from './collect-context.mjs';
import { createReviewSession } from './create-session.mjs';
import { finalizeReviewSession } from './finalize-session.mjs';
import { prepareReview } from './prepare-review.mjs';
import { runReviewSession } from './run-session.mjs';
import { throwSessionFailure } from './session-failure.mjs';

export async function runReviewPipeline(cwd, options) {
  let combined;
  let client;
  try {
    ({ combined } = await collectReviewContext({
      cwd,
      combine: options.combine,
      readDirectory: options.readDirectory,
      readFile: options.readFile,
      maxSourceChars: options.maxSourceChars,
      platform: options.platform,
    }));
    ({ client } = await prepareReview({
      envFile: options.envFile,
      readFile: options.readFile,
      openEnvFile: options.openEnvFile,
      inspectFile: options.inspectFile,
      createClient: options.createClient,
    }));
  } catch (cause) {
    return throwSessionFailure({
      cause,
      providerResponseReceived: false,
      write: options.write,
    });
  }
  let request;
  let controller;
  try {
    ({ request, controller } = createReviewSession({
      prompt: options.prompt,
      combined,
      model: options.model,
      plainText: options.plainText,
      add: options.add,
    }));
  } catch (cause) {
    return throwSessionFailure({
      cause,
      providerResponseReceived: false,
      write: options.write,
    });
  }
  try {
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
  } catch (cause) {
    if (cause?.result) throw cause;
    return throwSessionFailure({
      cause,
      providerResponseReceived: false,
      write: options.write,
    });
  }
}
