import { defaultDeveloperText, profileReviewRules } from "../../src/prompts/guidance.mjs";

test("provides the shared developer guidance", () => {
  expect(defaultDeveloperText).toContain("ignore_example");
  expect(defaultDeveloperText).toContain("copy-paste-ready");
  expect(defaultDeveloperText).toContain("reconcile the cited implementation");
  expect(defaultDeveloperText).toContain("Do not recommend changes that are already present");
  expect(defaultDeveloperText).toContain("one-shot reviewer");
  expect(defaultDeveloperText).toContain("partial");
  expect(defaultDeveloperText).toContain(
    "cross-check each real item against its own recommendation",
  );
  expect(defaultDeveloperText).toContain("Never put a no-issue statement in a real finding");
  expect(defaultDeveloperText).toContain('each rationale step starts with "Because"');
  expect(profileReviewRules).toContain("category sentinel");
});
