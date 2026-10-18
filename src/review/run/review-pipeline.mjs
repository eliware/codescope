import { createSetupFailure } from "../setup-failure.mjs";
import { collectAndPrepare } from "../pipeline/collect-and-prepare.mjs";
import { createRequest } from "../pipeline/create-request.mjs";
import { executeRequest } from "../pipeline/execute-request.mjs";
import { runReviewPhase } from "../pipeline/write-phase-failure.mjs";

export async function runReviewPipeline(cwd, options) {
  const prepared = await runReviewPhase(() => collectAndPrepare(cwd, options), {
    createFailure: createSetupFailure,
  });
  const { request, controller } = await runReviewPhase(
    () => createRequest(options, prepared.combined),
    {},
  );
  return runReviewPhase(
    () => executeRequest({ client: prepared.client, request, controller, options }),
    {},
  );
}
