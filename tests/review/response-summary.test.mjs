import { summarizeProviderResponse } from "../../src/review/response-summary.mjs";

test("summarizes provider output text and function calls", () => {
  const summary = summarizeProviderResponse({
    output_text: "done",
    usage: { input_tokens: 1 },
    output: [{ type: "function_call", name: "review", arguments: '{"ok":true}' }],
  });

  expect(summary).toMatchObject({
    output_text: "done",
    function_call_arguments: [{ name: "review" }],
  });
});

test("ignores non-function output items and invalid output collections", () => {
  const nonFunctionOutput = summarizeProviderResponse({ output: [{ type: "message" }] });
  const invalidOutput = summarizeProviderResponse({ output: { invalid: true } });

  expect(nonFunctionOutput).not.toHaveProperty("function_call_arguments");
  expect(invalidOutput).not.toHaveProperty("function_call_arguments");
});
