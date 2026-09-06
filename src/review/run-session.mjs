import { parseProviderResult } from './provider-result.mjs';
import { writeFallbackResult, writeJsonResult } from './output.mjs';
import { runDryRun } from './dry-run.mjs';
import { requestProviderResponse } from './provider-request.mjs';
import { createIncompleteResult, createProviderFailure } from './failure.mjs';
import { plainTextSessionResult, reviewSessionResult } from './session-result.mjs';

export async function runReviewSession({
  client,
  request,
  signal,
  write,
  dryRun,
  usage,
  plainText,
  testResults,
}) {
  let providerResponse;
  let providerResponseReceived = false;
  try {
    if (dryRun) {
      const output = await runDryRun({ client, request, signal, model: request.model, usage });
      await writeJsonResult(write, output);
      return output;
    }
    providerResponse = await requestProviderResponse(client, request, signal);
    providerResponseReceived = true;
    if (plainText !== undefined) {
      const { output, result } = plainTextSessionResult(providerResponse, usage);
      await writeJsonResult(write, output, 'prompt');
      return result;
    }
    const output = reviewSessionResult(
      providerResponse,
      request,
      request.model,
      usage,
      testResults,
      parseProviderResult,
    );
    await writeJsonResult(write, output);
    return output;
  } catch (cause) {
    const incomplete = providerResponseReceived
      ? createIncompleteResult(cause, providerResponse)
      : undefined;
    if (incomplete) await writeFallbackResult(write, incomplete);
    const failure = createProviderFailure(cause);
    if (cause?.code) failure.code = cause.code;
    if (incomplete) failure.result = incomplete;
    throw failure;
  }
}
