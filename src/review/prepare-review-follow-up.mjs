import { createReviewFollowUpInstructions } from "../prompts/re-review-guidance.mjs";

export function appendReviewFollowUp(request, firstOutput) {
  request.reasoning = { ...request.reasoning, effort: "low" };
  request.input.push({ role: "assistant", content: firstOutput });
  request.input.push({
    role: "user",
    content: [{ type: "input_text", text: createReviewFollowUpInstructions() }],
  });
  return request;
}
