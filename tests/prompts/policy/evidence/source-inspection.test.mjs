import { sourceInspectionPolicy } from "../../../../src/prompts/policy/evidence/source-inspection.mjs";

test("limits review to supplied complete source and never runs tests", () => {
  expect(sourceInspectionPolicy).toContain("CodeScope never runs tests");
  expect(sourceInspectionPolicy).toContain("Read the complete supplied source");
});
