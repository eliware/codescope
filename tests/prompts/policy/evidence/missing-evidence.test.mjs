import { missingEvidencePolicy } from "../../../../src/prompts/policy/evidence/missing-evidence.mjs";

test("treats absent evidence as unknown", () => {
  expect(missingEvidencePolicy).toBe(
    "A missing or excluded file does not prove failure or absence. Missing command output does not prove failure or success.",
  );
});
