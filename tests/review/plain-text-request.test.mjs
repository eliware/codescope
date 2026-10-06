import { preparePlainTextRequest } from "../../src/review/plain-text-request.mjs";
import {
  frameCustomPrompt,
  frameRepositoryContent,
} from "../../src/prompts/untrusted-boundary.mjs";

test("rejects a blank custom prompt", () => {
  expect(() => preparePlainTextRequest({}, "  ", "source")).toThrow(/non-empty/);
});

test("uses only the supplied prompt as the task and disables review tools", () => {
  const request = preparePlainTextRequest(
    { tool_choice: "required", parallel_tool_calls: true },
    "prompt",
    "context",
  );
  expect(request.tools).toEqual([]);
  expect(request.input[0].content[0].text).toBe(
    frameCustomPrompt(frameRepositoryContent("context"), "prompt"),
  );
  expect(request.input[0].content[0].text).not.toContain("REVIEW INSTRUCTIONS");
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
