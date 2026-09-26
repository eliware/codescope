import { createDryRunOutput } from "../../../src/review/dry-run/create-output.mjs";

test("projects the token count without a usage breakdown", () => {
  expect(createDryRunOutput(42, { model: "gpt-6-luna", usage: false })).toEqual({
    model: "gpt-6-luna",
    estimated_input_tokens: 42,
  });
});

test("adds cost details and defaults the pricing model when omitted", () => {
  expect(createDryRunOutput(0, { model: undefined, usage: true })).toMatchObject({
    model: undefined,
    estimated_input_tokens: 0,
    usage: { input_tokens: 0, estimated_cost_usd: 0 },
  });
});
