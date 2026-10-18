import { getProfile } from "../../src/profiles/index.mjs";

test("composes one public profile for each supported mode", () => {
  const review = getProfile("architecture", "review");
  const suggestion = getProfile("architecture", "suggest");
  expect(review.combine).toBeInstanceOf(Function);
  expect(review.prompt).toBeDefined();
  expect(suggestion.prompt).toBeDefined();
  expect(review.prompt.tools.some((tool) => tool.type === "web_search")).toBe(false);
  expect(suggestion.prompt.tools.some((tool) => tool.type === "web_search")).toBe(false);
});

test("adds web search only when the profile requests it", () => {
  const profile = getProfile("all", "review", true);
  expect(profile.prompt.tools[0].type).toBe("web_search");
  expect(profile.prompt.include).toContain("web_search_call.action.sources");
});

test("rejects unknown profile modes at the public profile boundary", () => {
  expect(() => getProfile("missing")).toThrow(/Unknown analysis profile/);
  expect(() => getProfile("architecture", "suggestion")).toThrow("Unknown profile mode");
});
