import { formatSingleRequestUsage } from "../../src/review/usage-reporting.mjs";

const model = "gpt-6-luna";

test("reports metadata for a single request", () => {
  const output = formatSingleRequestUsage(
    "suggestions",
    {
      usage: { input_tokens: 25, output_tokens: 5 },
    },
    model,
  );
  expect(output).toContain("suggestions\nRequest usage metadata:");
  expect(output).toContain('"input_tokens":25');
});
