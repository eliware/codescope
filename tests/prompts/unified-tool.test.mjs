import { createUnifiedTool } from "../../src/prompts/unified-tool.mjs";

test("creates a strict unified review tool with selected categories", () => {
  const tool = createUnifiedTool(["documentation"]);
  expect(tool.name).toBe("submit_unified_review");
  expect(tool.parameters.properties.issues.required).toEqual(["documentation"]);
  expect(tool.description).toContain("List each proven issue");
  expect(tool.parameters.properties.issues.properties.documentation.minItems).toBe(1);
  expect(tool.parameters.$defs.issue.required).toEqual(["severity", "locations", "issues"]);
  expect(tool.parameters.$defs.issue.properties.locations.minItems).toBe(1);
  expect(tool.parameters.$defs.issue.properties.issues.minItems).toBe(1);
  expect(tool.parameters.$defs.issue.properties.severity.enum).toContain("none");
  expect(tool.parameters.$defs.issue.properties).not.toHaveProperty("recommendation");
  expect(tool.parameters.$defs.issue.properties).not.toHaveProperty("rationale");
  expect(tool.parameters.$defs.issue.properties).not.toHaveProperty("ignore_example");
  expect(tool.parameters.$defs.issue.properties).not.toHaveProperty("evidence");
  expect(tool.parameters.$defs.issue.properties).not.toHaveProperty("impact");
});
