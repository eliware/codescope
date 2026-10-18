import { createCombinedPromptSources } from "../../../src/profiles/prompt-sources/combined.mjs";

test("builds combined and release prompt sources from the all-profile prompt", () => {
  let options;
  const { combinedAllPrompt, releasePrompt } = createCombinedPromptSources(
    (focus, tool, suppliedOptions) => {
      options = suppliedOptions;
      return { input: [{ role: "user", content: [{ type: "input_text", text: focus }] }] };
    },
  );
  expect(combinedAllPrompt.tools).toHaveLength(1);
  expect(releasePrompt).not.toEqual(combinedAllPrompt);
  expect(options.globalReviewInstructions).toBe("");
  expect(combinedAllPrompt.input).toHaveLength(2);
});
