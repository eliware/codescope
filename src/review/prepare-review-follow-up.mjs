import { createReviewFollowUpInstructions } from "../prompts/re-review-guidance.mjs";

export function appendReviewFollowUp(request, firstOutput) {
  const findingField = request.tool_choice?.name === "submit_unified_review" ? "finding" : "issue";
  request.input.push({ role: "assistant", content: firstOutput });
  request.input.push({
    role: "user",
    content: [{ type: "input_text", text: createReviewFollowUpInstructions(findingField) }],
  });
  return request;
}
