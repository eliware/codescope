import {
  formatFindingReviewUsage,
  formatSingleRequestUsage,
} from "../../src/review/usage-reporting.mjs";

const model = "gpt-6-luna";

test("keeps initial and final usage metadata with their respective finding reviews", () => {
  const initialResponse = { usage: { input_tokens: 100, output_tokens: 10 } };
  const finalResponse = { usage: { input_tokens: 200, output_tokens: 20 } };
  const output = formatFindingReviewUsage({
    initialOutput: "initial findings",
    finalOutput: "final findings",
    initialResponse,
    finalResponse,
    model,
    reviewed: true,
  });
  expect(output).toContain(
    "Running initial review...\ninitial findings\nInitial review usage metadata:",
  );
  expect(output).toContain("Detailed reasoning summary:\n(unavailable)");
  expect(output).toContain("Running final review...\nfinal findings\nFinal review usage metadata:");
  expect(output).toContain('"input_tokens":100');
  expect(output).toContain('"input_tokens":200');
});

test("reports initial usage and missing follow-up usage when the request fails", () => {
  const output = formatFindingReviewUsage({
    initialOutput: "initial findings",
    finalOutput: "initial findings",
    initialResponse: { usage: { input_tokens: 30, output_tokens: 5 } },
    model,
    reviewed: false,
    reasoningSummary: "Summary of initial review.",
  });
  expect(output).toContain("initial findings\nInitial review usage metadata:");
  expect(output).toContain('"input_tokens":30');
  expect(output).toContain("Follow-up usage metadata: unavailable (request failed)");
  expect(output).toContain("Detailed reasoning summary:\nSummary of initial review.");
});

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
