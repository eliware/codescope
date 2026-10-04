import { defaultDeveloperText, profileReviewRules } from "../../src/prompts/guidance.mjs";

test("provides the shared developer guidance", () => {
  expect(defaultDeveloperText).toContain("ignore_example");
  expect(defaultDeveloperText).toContain("copy-paste-ready");
  expect(defaultDeveloperText).toContain("Review the supplied repository context");
  expect(defaultDeveloperText).not.toContain("reconcile");
  expect(defaultDeveloperText).not.toContain("cross-check");
  expect(defaultDeveloperText).toContain("one-shot reviewer");
  expect(defaultDeveloperText).not.toContain("run tests");
  expect(defaultDeveloperText).toContain('rationale steps that start with "Because"');
  expect(profileReviewRules).toContain("category sentinel");
});
