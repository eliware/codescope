import { createUnifiedTool } from '../../src/prompts/unified-tool.mjs';

test('creates strict unified tools with required categories', () => {
  const tool = createUnifiedTool(['documentation']);
  expect(tool.name).toBe('submit_unified_review');
  expect(tool.parameters.properties.findings.required).toEqual(['documentation']);
});
