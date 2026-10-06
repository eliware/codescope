import { profileVerdictPolicy } from "../../../../src/prompts/policy/evidence/profile-verdict.mjs";

test("limits verdict handling to review profiles", () => {
  expect(profileVerdictPolicy).toContain("Use the API verdict as status for review profiles only");
  expect(profileVerdictPolicy).toContain(
    "Suggestion and custom-prompt profiles do not check a verdict",
  );
});
