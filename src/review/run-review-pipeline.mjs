import { createSetupFailure } from './setup-failure.mjs';
import { collectAndPrepare } from './pipeline/collect-and-prepare.mjs';
import { createRequest } from './pipeline/create-request.mjs';
import { executeRequest } from './pipeline/execute-request.mjs';
import { runReviewPhase } from './pipeline/write-phase-failure.mjs';

export async function runReviewPipeline(cwd, options) {
  const prepared = await runReviewPhase(
    () => collectAndPrepare(cwd, options),
    { write: options.write, createFailure: createSetupFailure, fallbackCause: new Error('Review setup failed') },
  );
  const { request, controller } = await runReviewPhase(
    () => createRequest(options, prepared.combined),
    { write: options.write },
  );
  return runReviewPhase(
    () => executeRequest({ client: prepared.client, request, controller, options }),
    { write: options.write },
  );
}
