import { writeProviderResult } from '../output/write-provider-output.mjs';
import { runDryRun } from '../dry-run.mjs';
import { createSessionResult } from '../session-result.mjs';

export async function runDrySession({ client, request, signal, write, usage }) {
  const output = await runDryRun({ client, request, signal, model: request.model, usage });
  await writeProviderResult(write, output);
  return createSessionResult('dry-run', output);
}
