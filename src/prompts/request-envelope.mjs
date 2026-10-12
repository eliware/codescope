import { reviewTool } from "./review-tool.mjs";

export const webSearchTool = {
  type: "web_search",
  user_location: { type: "approximate" },
  search_context_size: "medium",
};

export const baseRequest = {
  model: "gpt-6-luna",
  service_tier: "default",
  text: { format: { type: "text" }, verbosity: "low" },
  reasoning: { effort: "none", mode: "standard", summary: "auto" },
  tools: [webSearchTool, reviewTool],
  tool_choice: { type: "function", name: "submit_review" },
  parallel_tool_calls: false,
  store: false,
  include: ["reasoning.encrypted_content", "web_search_call.action.sources"],
};
