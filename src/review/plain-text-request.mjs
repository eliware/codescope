import { frameCustomPrompt, frameRepositoryContent } from "./request/content-boundary.mjs";
import { webSearchTool } from "../profiles/tool-decoration.mjs";

export function preparePlainTextRequest(request, plainText, combined, webSearch = false) {
  if (typeof plainText !== "string" || !plainText.trim())
    throw new Error("Custom prompt must be a non-empty string");
  request = structuredClone(request);
  const repositoryContent = frameRepositoryContent(combined);
  const text = frameCustomPrompt(repositoryContent, plainText);
  request.input = [{ role: "user", content: [{ type: "input_text", text }] }];
  request.tools = webSearch ? [webSearchTool] : [];
  request.include = (request.include ?? []).filter(
    (item) => item !== "web_search_call.action.sources",
  );
  if (webSearch) request.include.push("web_search_call.action.sources");
  delete request.text;
  delete request.tool_choice;
  delete request.parallel_tool_calls;
  return request;
}
