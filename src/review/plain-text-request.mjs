import { frameCustomPrompt, frameRepositoryContent } from "../prompts/untrusted-boundary.mjs";

export function preparePlainTextRequest(request, plainText, combined) {
  if (typeof plainText !== "string" || !plainText.trim())
    throw new Error("Custom prompt must be a non-empty string");
  request = structuredClone(request);
  const repositoryContent = frameRepositoryContent(combined);
  const text = frameCustomPrompt(repositoryContent, plainText);
  request.input = [{ role: "user", content: [{ type: "input_text", text }] }];
  request.tools = [];
  delete request.text;
  delete request.tool_choice;
  delete request.parallel_tool_calls;
  return request;
}
