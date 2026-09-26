import { countInputTokens } from "./dry-run/count-input-tokens.mjs";
import { createDryRunOutput } from "./dry-run/create-output.mjs";

export async function runDryRun({ client, request, signal, model, usage }) {
  const inputTokens = await countInputTokens(client, request, signal);
  return createDryRunOutput(inputTokens, { model, usage });
}
