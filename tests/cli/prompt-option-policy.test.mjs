import { isPromptOption } from "../../src/cli/prompt-option-policy.mjs";

test("recognizes supported prompt options but leaves option-like prose as text", () => {
  expect(isPromptOption("--usage")).toBe(true);
  expect(isPromptOption("--dry-run")).toBe(true);
  expect(isPromptOption("--model=gpt-6-luna")).toBe(true);
  expect(isPromptOption("--not-an-option")).toBe(false);
  expect(isPromptOption("--effort=details")).toBe(false);
});
