import { parseProviderResult } from './provider-result.mjs';
import { writeFallbackResult, writeJsonResult } from './output.mjs';
import { parsePlainTextJsonResponse } from './plain-text.mjs';
import { runDryRun } from './dry-run.mjs';
import { requestProviderResponse } from './provider-request.mjs';
import { createIncompleteResult, createProviderFailure } from './failure.mjs';
import { withReviewUsage } from './usage.mjs';
import { testEvidenceBlocks } from './test-status.mjs';

export async function executeReviewSession({
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
  const toolNames = (request.tools ?? []).map((tool) => tool?.name);
  const combined =
    request.tool_choice === 'auto' &&
    toolNames.includes('submit_review') &&
    toolNames.includes('submit_suggestions');
  try {
    if (dryRun) {
      const output = await runDryRun({ client, request, signal, model: request.model, usage });
      await writeJsonResult(write, output);
      return output;
    }
    providerResponse = await requestProviderResponse(client, request, combined, signal);
    providerResponseReceived = true;
    if (plainText !== undefined) {
      const output = parsePlainTextJsonResponse(providerResponse);
      await writeJsonResult(write, output, 'prompt');
      return { ...output, ...(usage ? { usage: providerResponse.usage ?? null } : {}) };
    }
    const result = parseProviderResult(providerResponse, request, combined);
    if (result.verdict === 'pass' && testEvidenceBlocks(testResults)) result.verdict = 'block';
    const output = withReviewUsage(result, providerResponse, request.model, usage);
    await writeJsonResult(write, output);
    return output;
  } catch (cause) {
    if (providerResponseReceived) await writeFallbackResult(write, createIncompleteResult(cause, providerResponse));
    const failure = createProviderFailure(cause);
    if (cause?.code) failure.code = cause.code;
    throw failure;
  }
}
