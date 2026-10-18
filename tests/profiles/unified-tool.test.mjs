import { createUnifiedTool } from "../../src/profiles/unified-tool.mjs";

test("builds the default unified review schema", () => {
  const tool = createUnifiedTool();
  expect(tool.parameters.properties.issues.required).toContain("correctness");
  expect(tool.parameters.$defs.issue.properties.severity.enum).toContain("none");
});

test("builds a unified schema for selected categories", () => {
  const tool = createUnifiedTool(["documentation"]);
  expect(tool.parameters.properties.issues.required).toEqual(["documentation"]);
});
