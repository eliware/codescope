import { sourceInspectionPolicy } from "../../../../src/prompts/policy/evidence/source-inspection.mjs";

test("limits review to supplied complete source and never runs tests", () => {
  expect(sourceInspectionPolicy).toContain("CodeScope does not run tests");
  expect(sourceInspectionPolicy).toContain("Read all supplied source files");
});
