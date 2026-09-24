import { validatePromptRequest } from "../../../src/review/options/validate-prompt-request.mjs";

test("rejects prompt requests combined with usage or dry-run", () => {
  expect(() => validatePromptRequest({ plainText: "question", usage: true })).toThrow(
    /cannot be combined/,
  );
  expect(() => validatePromptRequest({ plainText: "question", dryRun: true })).toThrow(
    /cannot be combined/,
  );
});

test("validates supplied prompt structure", () => {
  const prompt = {
    input: [{ role: "developer", content: [{ type: "input_text", text: "review" }] }],
  };
  expect(() => validatePromptRequest({ prompt })).not.toThrow();
  expect(() => validatePromptRequest({ prompt: {} })).toThrow(/input/);
});
