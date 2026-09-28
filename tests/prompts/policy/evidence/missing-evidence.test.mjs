import { missingEvidencePolicy } from "../../../../src/prompts/policy/evidence/missing-evidence.mjs";

test("treats absent evidence as unknown", () => {
  expect(missingEvidencePolicy).toBe(
    "Missing or excluded files and absent command output are not evidence of failure or absence.",
  );
});
