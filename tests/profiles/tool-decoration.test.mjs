import { decorateProfilePrompt } from "../../src/profiles/tool-decoration.mjs";

test("decorates suggestion prompts with the required tool", () => {
  const prompt = decorateProfilePrompt({ tools: [] }, "suggest", ["security"]);
  expect(prompt.tools).toHaveLength(2);
  expect(prompt.tools[0].type).toBe("web_search");
  expect(prompt.tool_choice).toBe("auto");
});
test("leaves generic review prompts without scoped categories undecorated", () => {
  const prompt = decorateProfilePrompt({ input: [] }, "review");
  expect(prompt.tools).toHaveLength(1);
  expect(prompt.tools[0].type).toBe("web_search");
  expect(prompt.tool_choice).toBeUndefined();
});

test("keeps a generic review tool with web search", () => {
  const reviewTool = { type: "function", name: "submit_unified_review" };
  const prompt = decorateProfilePrompt({ tools: [reviewTool] }, "review");
  expect(prompt.tools).toEqual([
    { type: "web_search", user_location: { type: "approximate" }, search_context_size: "medium" },
    reviewTool,
  ]);
});

test("uses all suggestion categories when none are supplied", () => {
  const prompt = decorateProfilePrompt({ tools: [] }, "suggest");
  expect(prompt.tools).toHaveLength(2);
  expect(prompt.tool_choice).toBe("auto");
});
