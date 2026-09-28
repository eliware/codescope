import { createCombinedPromptSources } from "../../../src/profiles/prompt-sources/combined.mjs";

test("builds combined and release prompt sources from the all-profile prompt", () => {
  const { combinedAllPrompt, releasePrompt } = createCombinedPromptSources((focus) => ({
    input: [{ role: "user", content: [{ type: "input_text", text: focus }] }],
  }));
  expect(combinedAllPrompt.tools).toHaveLength(1);
  expect(releasePrompt).not.toEqual(combinedAllPrompt);
});
