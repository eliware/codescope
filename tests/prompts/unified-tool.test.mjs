import { createUnifiedTool } from "../../src/prompts/unified-tool.mjs";

test("creates a strict unified review tool with selected categories", () => {
  const tool = createUnifiedTool(["documentation"]);
  expect(tool.name).toBe("submit_unified_review");
  expect(tool.parameters.properties.findings.required).toEqual(["documentation"]);
  expect(tool.description).toContain("all actionable findings");
  expect(tool.parameters.properties.findings.properties.documentation.minItems).toBe(1);
  expect(tool.parameters.$defs.finding.required).toEqual(["severity", "location", "finding"]);
  expect(tool.parameters.$defs.finding.properties.severity.enum).toContain("none");
  expect(tool.parameters.$defs.finding.properties).not.toHaveProperty("recommendation");
  expect(tool.parameters.$defs.finding.properties).not.toHaveProperty("rationale");
  expect(tool.parameters.$defs.finding.properties).not.toHaveProperty("ignore_example");
  expect(tool.parameters.$defs.finding.properties).not.toHaveProperty("evidence");
  expect(tool.parameters.$defs.finding.properties).not.toHaveProperty("impact");
});
