import { decorateProfilePrompt } from "../../src/profiles/tool-decoration.mjs";

test("adds only the suggestion schema by default", () => {
  const prompt = decorateProfilePrompt({ tools: [] }, "suggest", ["security"]);
  expect(prompt.tools).toHaveLength(1);
  expect(prompt.tools[0].name).toBe("submit_suggestions");
  expect(prompt.tool_choice).toBe("auto");
});
test("leaves generic review prompts without scoped categories undecorated", () => {
  const prompt = decorateProfilePrompt({ input: [] }, "review");
  expect(prompt.tools).toEqual([]);
  expect(prompt.tool_choice).toBeUndefined();
});

test("adds web search only when enabled", () => {
  const reviewTool = { type: "function", name: "submit_unified_review" };
  const prompt = decorateProfilePrompt({ tools: [reviewTool] }, "review", undefined, true);
  expect(prompt.tools).toEqual([
    { type: "web_search", user_location: { type: "approximate" }, search_context_size: "medium" },
    reviewTool,
  ]);
  expect(prompt.include).toContain("web_search_call.action.sources");
});

test("adds web search to suggestion and scoped review prompts when enabled", () => {
  const suggestion = decorateProfilePrompt({ tools: [] }, "suggest", ["security"], true);
  const scopedReview = decorateProfilePrompt(
    { tools: [{ type: "function", name: "review" }] },
    "review",
    ["security"],
    true,
  );
  expect(suggestion.tools[0].type).toBe("web_search");
  expect(scopedReview.tools[0].type).toBe("web_search");
});

test("uses all suggestion categories when none are supplied", () => {
  const prompt = decorateProfilePrompt({ tools: [] }, "suggest");
  expect(prompt.tools).toHaveLength(1);
  expect(prompt.tool_choice).toBe("auto");
});
