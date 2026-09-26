import { calculateUsageCost } from "../../pricing/calculator.mjs";

export function createDryRunOutput(inputTokens, { model, usage }) {
  const output = { model, estimated_input_tokens: inputTokens };
  if (usage) {
    output.usage = {
      input_tokens: inputTokens,
      estimated_cost_usd: calculateUsageCost(model ?? "gpt-6-luna", {
        input_tokens: inputTokens,
      }),
    };
  }
  return output;
}
