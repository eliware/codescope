import { formatUsageMetadata } from "../../src/review/format-usage-metadata.mjs";

test("formats provider usage and calculated cost", () => {
  expect(
    formatUsageMetadata(
      {
        usage: {
          input_tokens: 100,
          output_tokens: 10,
          input_tokens_details: { cached_tokens: 50 },
        },
      },
      "gpt-6-luna",
      "Review",
    ),
  ).toBe(
    'Review usage metadata: {"model":"gpt-6-luna","input_tokens":100,"cached_tokens":50,"cache_write_tokens":0,"output_tokens":10,"long_context":false,"uncached_input_cost_usd":0.000005,"cached_input_cost_usd":0,"cache_write_cost_usd":0,"output_cost_usd":0.000005,"estimated_cost_usd":0.000011}',
  );
});

test("reports unavailable metadata when provider usage is absent or invalid", () => {
  expect(formatUsageMetadata({}, "gpt-6-luna")).toBe("Request usage metadata: unavailable");
  expect(formatUsageMetadata({ usage: { input_tokens: -1 } }, "gpt-6-luna", "Review")).toBe(
    "Review usage metadata: unavailable",
  );
});
