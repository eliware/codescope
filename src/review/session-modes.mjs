import { writeJsonResult } from './output.mjs';
import { runDryRun } from './dry-run.mjs';
import { requestProviderResponse } from './provider-request.mjs';
import { plainTextSessionResult, reviewSessionResult } from './session-result.mjs';
import { parseProviderResult } from './provider-result.mjs';

export async function runDrySession({ client, request, signal, write, usage }) {
  const output = await runDryRun({ client, request, signal, model: request.model, usage });
  await writeJsonResult(write, output);
  return output;
}

export async function runProviderSession({
  client,
  request,
  signal,
  usage,
  plainText,
  testResults,
}) {
  const providerResponse = await requestProviderResponse(client, request, signal);
  if (plainText !== undefined) {
    const { output, result } = plainTextSessionResult(providerResponse, usage);
    return { providerResponse, result, output, outputKind: 'prompt' };
  }
  const output = reviewSessionResult(
    providerResponse,
    request,
    request.model,
    usage,
    testResults,
    parseProviderResult,
  );
  return { providerResponse, result: output, output };
}
