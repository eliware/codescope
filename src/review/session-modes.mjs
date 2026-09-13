import { writeProviderResult } from './output.mjs';
import { runDryRun } from './dry-run.mjs';
import { requestProviderResponse } from './provider-request.mjs';
import { responseText } from '../response/provider-text.mjs';
import { createSessionResult } from './session-result.mjs';

export async function runDrySession({ client, request, signal, write, usage }) {
  const output = await runDryRun({ client, request, signal, model: request.model, usage });
  await writeProviderResult(write, output);
  return createSessionResult('dry-run', output);
}

export async function runProviderSession({
  client,
  request,
  signal,
  plainText,
}) {
  const providerResponse = await requestProviderResponse(client, request, signal);
  const output = responseText(providerResponse, request);
  return createSessionResult(
    plainText === undefined ? 'review' : 'prompt',
    output,
    providerResponse,
  );
}
