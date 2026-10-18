import { fillPrompt, readPrompt } from "../../../src/profiles/prompt-sources/read-content.mjs";

test("reads prompt text from Markdown files", () => {
  expect(readPrompt("boundary-content.md")).toContain("{{CONTENT}}");
});

test("fills template values literally", () => {
  expect(fillPrompt("boundary-custom.md", { CONTENT: "$& source", PROMPT: "instructions" })).toBe(
    "--- BEGIN REVIEW CONTENT ---\n$& source\n--- END REVIEW CONTENT ---\n\ninstructions",
  );
});

test("returns a Markdown prompt when it has no template values", () => {
  expect(fillPrompt("guidance-profile-rules.md", {})).toBe(readPrompt("guidance-profile-rules.md"));
});
