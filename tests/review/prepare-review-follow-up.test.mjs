import { appendReviewFollowUp } from "../../src/review/prepare-review-follow-up.mjs";

test("appends the first output as assistant text and a follow-up user message", () => {
  const request = { input: [{ role: "user", content: "repository" }] };
  const result = appendReviewFollowUp(request, "initial result");
  expect(result).toBe(request);
  expect(request.input).toHaveLength(3);
  expect(request.input[1]).toEqual({ role: "assistant", content: "initial result" });
  expect(request.input[2].role).toBe("user");
  expect(request.input[2].content[0].type).toBe("input_text");
  expect(request.input[2].content[0].text).toBe(
    "Double-check the preceding review. Correct or remove inaccurate findings, retain valid findings, and return the complete final review using the required tool and schema. Do not add new findings.",
  );
});
