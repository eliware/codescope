import { appendReviewFollowUp } from "../../src/review/prepare-review-follow-up.mjs";

test("appends the first output as assistant text and a follow-up user message", () => {
  const request = { input: [{ role: "user", content: "repository" }] };
  const result = appendReviewFollowUp(request, "initial result");
  expect(result).toBe(request);
  expect(request.input).toHaveLength(3);
  expect(request.input[1]).toEqual({ role: "assistant", content: "initial result" });
  expect(request.input[2].role).toBe("user");
  expect(request.input[2].content[0].type).toBe("input_text");
  expect(request.input[2].content[0].text).toContain("Re-review only the findings");
});

test("uses the unified tool's finding sentinel field", () => {
  const request = {
    input: [{ role: "user", content: "repository" }],
    tool_choice: { type: "function", name: "submit_unified_review" },
  };
  appendReviewFollowUp(request, "initial result");
  expect(request.input[2].content[0].text).toContain('finding "No issues found."');
});
