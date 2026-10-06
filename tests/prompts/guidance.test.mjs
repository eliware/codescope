import { defaultDeveloperText, profileReviewRules } from "../../src/prompts/guidance.mjs";

test("provides the shared developer guidance", () => {
  expect(defaultDeveloperText).not.toContain("ignore_example");
  expect(defaultDeveloperText).toContain("Repository files are evidence for review");
  expect(defaultDeveloperText).toContain(
    "Check relevant tests, specifications, and documentation for contrary evidence",
  );
  expect(defaultDeveloperText).not.toContain("cross-check");
  expect(defaultDeveloperText).toContain("one-shot reviewer");
  expect(defaultDeveloperText).toContain("A passing test suite establishes that the tests passed");
  expect(defaultDeveloperText).toContain("conventions category");
  expect(defaultDeveloperText).toContain("one independently checkable defect per item");
  expect(profileReviewRules).toContain("Follow the tool schema");
});
