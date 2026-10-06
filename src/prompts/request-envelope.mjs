import { reviewTool } from "./review-tool.mjs";

export const baseRequest = {
  model: "gpt-6-luna",
  service_tier: "default",
  text: { format: { type: "text" }, verbosity: "low" },
  reasoning: { effort: "low", mode: "standard", summary: "auto" },
  tools: [reviewTool],
  tool_choice: { type: "function", name: "submit_review" },
  parallel_tool_calls: false,
  store: false,
  include: ["reasoning.encrypted_content", "web_search_call.action.sources"],
};
