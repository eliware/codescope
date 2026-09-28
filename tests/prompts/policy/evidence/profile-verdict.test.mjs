import { profileVerdictPolicy } from "../../../../src/prompts/policy/evidence/profile-verdict.mjs";

test("limits verdict handling to review profiles", () => {
  expect(profileVerdictPolicy).toContain("normal review and unified-review profiles");
  expect(profileVerdictPolicy).toContain("suggestion and custom-prompt profiles do not validate");
});
