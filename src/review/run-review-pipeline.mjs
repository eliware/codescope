import { collectReviewContext } from './collect-context.mjs';
import { createReviewSession } from './create-session.mjs';
import { finalizeReviewSession } from './finalize-session.mjs';
import { prepareReview } from './prepare-review.mjs';
import { runReviewSession } from './run-session.mjs';

export async function runReviewPipeline(cwd, options) {
  const { client } = await prepareReview({
    envFile: options.envFile,
    readFile: options.readFile,
    readEnvFile: options.readEnvFile,
    inspectFile: options.inspectFile,
    inspectPermissions: options.inspectPermissions,
    platform: options.platform,
    createClient: options.createClient,
  });
  const { testResults, combined } = await collectReviewContext({
    cwd,
    includesTests: options.includesTests,
    omitTestResults: options.omitTestResults,
    testTimeoutMs: options.testTimeoutMs,
    runTestCommand: options.runTestCommand,
    redactOutput: options.redactTestOutput,
    combine: options.combine,
    readDirectory: options.readDirectory,
    readFile: options.readFile,
    maxSourceChars: options.maxSourceChars,
    platform: options.platform,
  });
  const { request, controller } = createReviewSession({
    prompt: options.prompt,
    combined,
    model: options.model,
    plainText: options.plainText,
  });
  return finalizeReviewSession({
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
        testResults,
      }),
  });
}
