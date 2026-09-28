import { createAnalysisPromptSources } from "../../../src/profiles/prompt-sources/analysis.mjs";

test("registers the priority prompt variants and exposes the analysis factory", () => {
  const result = createAnalysisPromptSources((focus) => ({ focus }));
  expect(Object.keys(result.sources)).toEqual(["p0", "p0-1", "p0-2", "p0-3"]);
  expect(result.createAnalysisPrompt("focus").focus).toContain("focus");
});
