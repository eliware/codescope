import { createUnifiedTool } from "../../src/prompts/unified-tool.mjs";

test("creates strict unified tools with required categories", () => {
  const tool = createUnifiedTool(["documentation"]);
  expect(tool.name).toBe("submit_unified_review");
  expect(tool.parameters.properties.findings.required).toEqual(["documentation"]);
  expect(tool.parameters.$defs.finding.properties.rationale).toMatchObject({
    type: "array",
    items: { type: "string" },
  });
  expect(tool.description).toContain("remove any item whose recommendation says no change");
  expect(tool.parameters.$defs.finding.properties.recommendation.description).toContain(
    "Never say no change is needed",
  );
});
