import { removeSignalHandlers } from './cleanup.mjs';
import { validateReviewOptions } from './options.mjs';
import { initializeReviewClient } from './client.mjs';
import { registerReviewSignals } from './signals.mjs';
import { createReviewDefaults } from './defaults.mjs';
import { resolveReviewSetup } from './setup.mjs';
import { collectReviewEvidence } from './evidence.mjs';
import { executeReviewSession } from './session.mjs';
import { prepareReviewRequest } from './request-phase.mjs';
export { collectTestResults, redactTestOutput, testEvidenceBlocks } from './test-results.mjs';

export async function runReview(cwd, options) {
  const defaults = createReviewDefaults();
  const {
    write,
    readFile,
    readEnvFile = readFile,
    readDirectory,
    envFile,
    prompt,
    combine,
    maxSourceChars,
    usage,
    dryRun,
    includesTests,
    omitTestResults,
    testTimeoutMs,
    runTestCommand,
    redactTestOutput: redactOutput,
    model,
    plainText,
    createClient,
    register,
    inspectFile,
    inspectPermissions,
    platform,
  } = { ...defaults, ...options };
  validateReviewOptions(cwd, {
    maxSourceChars,
    testTimeoutMs,
    usage,
    dryRun,
    includesTests,
    omitTestResults,
    write,
    readFile,
    readEnvFile,
    combine,
    runTestCommand,
    redactOutput,
    createClient,
    register,
  });
  // Programmatic callers own the consistency of injected filesystem collaborators; the CLI uses the secure defaults.
  const { token } = await resolveReviewSetup({
    envFile,
    readFile,
    readEnvFile,
    inspectFile,
    inspectPermissions,
    platform,
  });
  const { testResults, combined } = await collectReviewEvidence({
    cwd,
    includesTests,
    omitTestResults,
    testTimeoutMs,
    runTestCommand,
    redactOutput,
    combine,
    readDirectory,
    readFile,
    maxSourceChars,
  });

  const request = prepareReviewRequest(prompt, combined, model, plainText);

  const controller = new AbortController();
  const client = initializeReviewClient(createClient, token);
  let signals;
  try {
    signals = registerReviewSignals(register, controller);
    return await executeReviewSession({
      client,
      request,
      signal: controller.signal,
      write,
      dryRun,
      usage,
      plainText,
      testResults,
    });
  } finally {
    controller.abort();
    removeSignalHandlers(signals);
  }
}
