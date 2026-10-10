import { defaultDeveloperText, profileReviewRules } from "../../src/prompts/guidance.mjs";

test("provides the shared developer guidance", () => {
  expect(defaultDeveloperText).not.toContain("ignore_example");
  expect(defaultDeveloperText).toContain("Use the supplied code, tests, specifications");
  expect(defaultDeveloperText).toContain("Check related tests, specifications, and docs");
  expect(defaultDeveloperText).not.toContain("cross-check");
  expect(defaultDeveloperText).toContain("one-shot reviewer");
  expect(defaultDeveloperText).toContain("Treat this as the supplied test status");
  expect(defaultDeveloperText).toContain("conventions category");
  expect(defaultDeveloperText).toContain("Put one defect in each issue");
  expect(profileReviewRules).toContain("Use the tool schema's no-issues sentinel");
});
