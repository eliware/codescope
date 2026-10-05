import { createUnifiedTool } from "../../src/prompts/unified-tool.mjs";

test("creates a strict unified review tool with selected categories", () => {
  const tool = createUnifiedTool(["documentation"]);
  expect(tool.name).toBe("submit_unified_review");
  expect(tool.parameters.properties.findings.required).toEqual(["documentation"]);
  expect(tool.description).toContain("all actionable findings");
});
