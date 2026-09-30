import { preparePlainTextRequest } from "../../src/review/plain-text-request.mjs";
import { frameUntrustedContent } from "../../src/prompts/untrusted-boundary.mjs";

test("rejects a blank custom prompt", () => {
  expect(() => preparePlainTextRequest({}, "  ", "source")).toThrow(/non-empty/);
});

test("uses only the supplied prompt as task instructions and disables review tools", () => {
  const request = preparePlainTextRequest(
    { tool_choice: "required", parallel_tool_calls: true },
    "prompt",
    "context",
  );
  expect(request.tools).toEqual([]);
  expect(request.input[0].content[0].text).toBe(
    `${frameUntrustedContent("REPOSITORY CONTEXT", "context")}\n\nprompt`,
  );
});

test("preserves supplied prompt whitespace verbatim", () => {
  const prompt = " \nReview this exact text.\t\n";
  const request = preparePlainTextRequest({}, prompt, "context");
  expect(request.input[0].content[0].text).toBe(
    `${frameUntrustedContent("REPOSITORY CONTEXT", "context")}\n\n${prompt}`,
  );
});

test("frames repository context with a boundary token absent from its content", () => {
  const combined = "repository text contains CODESCOPE_REPOSITORY_CONTEXT_BOUNDARY";
  const request = preparePlainTextRequest({}, "review", combined);
  expect(request.input[0].content[0].text).toBe(
    `${frameUntrustedContent("REPOSITORY CONTEXT", combined)}\n\nreview`,
  );
});
