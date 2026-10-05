import { appendReviewFollowUp } from "../../src/review/prepare-review-follow-up.mjs";
import { createReviewFollowUpInstructions } from "../../src/prompts/re-review-guidance.mjs";

test("prepares the same request for medium-effort follow-up review", () => {
  const request = {
    input: [{ role: "user", content: "repository" }],
    reasoning: { effort: "none", summary: "auto" },
  };
  const result = appendReviewFollowUp(request, "initial result");
  expect(result).toBe(request);
  expect(request.input).toHaveLength(3);
  expect(request.input[1]).toEqual({ role: "assistant", content: "initial result" });
  expect(request.reasoning).toEqual({ effort: "medium", summary: "detailed" });
  expect(request.input[2].role).toBe("user");
  expect(request.input[2].content[0].type).toBe("input_text");
  expect(request.input[2].content[0].text).toBe(createReviewFollowUpInstructions());
});
