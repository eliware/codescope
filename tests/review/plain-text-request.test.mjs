import { preparePlainTextRequest } from "../../src/review/plain-text-request.mjs";
import {
  frameCustomPrompt,
  frameRepositoryContent,
} from "../../src/review/request/content-boundary.mjs";

test("rejects a blank custom prompt", () => {
  expect(() => preparePlainTextRequest({}, "  ", "source")).toThrow(/non-empty/);
});

test("includes web search without review tools when enabled", () => {
  const request = preparePlainTextRequest(
    { tool_choice: "required", parallel_tool_calls: true },
    "prompt",
    "context",
    true,
  );
  expect(request.tools).toEqual([
    { type: "web_search", user_location: { type: "approximate" }, search_context_size: "medium" },
  ]);
  expect(request.include).toContain("web_search_call.action.sources");
  expect(request.input[0].content[0].text).toBe(
    frameCustomPrompt(frameRepositoryContent("context"), "prompt"),
  );
  expect(request.input[0].content[0].text).not.toContain("REVIEW INSTRUCTIONS");
});

test("does not include tools by default", () => {
  const request = preparePlainTextRequest(
    { tools: [{ type: "function", name: "review" }] },
    "prompt",
    "context",
  );
  expect(request.tools).toEqual([]);
});

test("removes all tools when the caller disables web search", () => {
  const request = preparePlainTextRequest(
    {
      tools: [{ type: "function", name: "review" }],
      include: ["reasoning.encrypted_content", "web_search_call.action.sources"],
    },
    "prompt",
    "context",
    false,
  );
  expect(request.tools).toEqual([]);
  expect(request.include).toEqual(["reasoning.encrypted_content"]);
});

test("preserves supplied prompt whitespace verbatim", () => {
  const prompt = " \nReview this exact text.\t\n";
  const request = preparePlainTextRequest({}, prompt, "context");
  expect(request.input[0].content[0].text).toBe(
    frameCustomPrompt(frameRepositoryContent("context"), prompt),
  );
});

test("frames repository context with simple review-content markers", () => {
  const combined = "repository text";
  const request = preparePlainTextRequest({}, "review", combined);
  expect(request.input[0].content[0].text).toBe(
    frameCustomPrompt(frameRepositoryContent(combined), "review"),
  );
  expect(request.input[0].content[0].text).toContain("--- BEGIN REVIEW CONTENT ---");
  expect(request.input[0].content[0].text).toContain("--- END REVIEW CONTENT ---");
  expect(request.input[0].content[0].text).not.toContain("BOUNDARY:");
});
