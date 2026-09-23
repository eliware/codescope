import { createSetupFailure } from './failure.mjs';
import { collectAndPrepare } from './pipeline/collect-and-prepare.mjs';
import { createRequest } from './pipeline/create-request.mjs';
import { executeRequest } from './pipeline/execute-request.mjs';
import { writePhaseFailure } from './pipeline/write-phase-failure.mjs';

export async function runReviewPipeline(cwd, options) {
  let prepared;
  try {
    prepared = await collectAndPrepare(cwd, options);
  } catch (cause) {
    return writePhaseFailure({ cause, write: options.write, createFailure: createSetupFailure, fallbackCause: new Error('Review setup failed') });
  }
  let request;
  let controller;
  try {
    ({ request, controller } = createRequest(options, prepared.combined));
  } catch (cause) {
    return writePhaseFailure({ cause, write: options.write });
  }
  try {
    return await executeRequest({ client: prepared.client, request, controller, options });
  } catch (cause) {
    if (cause?.result) throw cause;
    return writePhaseFailure({ cause, write: options.write });
  }
}
