import { createCombinedPromptSources } from "../../../src/profiles/prompt-sources/combined.mjs";
import { createProfilePrompt } from "../../../src/profiles/prompt/sources.mjs";

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

test("includes environment-file status rules in all and release prompts", () => {
  const { combinedAllPrompt, releasePrompt } = createCombinedPromptSources(createProfilePrompt);

  for (const prompt of [combinedAllPrompt, releasePrompt]) {
    const text = prompt.input[2].content[0].text;
    expect(text).toContain(
      "Do not claim that an untracked environment file is tracked or published.",
    );
    expect(text).toContain("Do not infer tracking or ignore status when Git status is unknown.");
    expect(text).toContain("Do not report a secret exposure from environment-file metadata alone.");
  }
});
