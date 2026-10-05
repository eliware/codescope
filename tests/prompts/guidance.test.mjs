import { defaultDeveloperText, profileReviewRules } from "../../src/prompts/guidance.mjs";

test("provides the shared developer guidance", () => {
  expect(defaultDeveloperText).not.toContain("ignore_example");
  expect(defaultDeveloperText).toContain("Review the supplied repository context");
  expect(defaultDeveloperText).not.toContain("reconcile");
  expect(defaultDeveloperText).not.toContain("cross-check");
  expect(defaultDeveloperText).toContain("one-shot reviewer");
  expect(defaultDeveloperText).not.toContain("run tests");
  expect(defaultDeveloperText).toContain("conventions category");
  expect(defaultDeveloperText).toContain("Evaluate each finding claim independently");
  expect(defaultDeveloperText).toContain("retain and accurately narrow it");
  expect(profileReviewRules).toContain("category sentinel");
});
