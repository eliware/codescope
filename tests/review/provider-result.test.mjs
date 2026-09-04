import { parseProviderResult, toolCategories } from '../../src/review/provider-result.mjs';

test('extracts categories from the active tool schema', () => {
  expect(
    toolCategories({
      parameters: { properties: { issues: { properties: { correctness: {}, security: {} } } } },
    }),
  ).toEqual(['correctness', 'security']);
  expect(toolCategories({ parameters: { properties: {} } })).toBeUndefined();
});

test('routes a single review tool response through the response parser', () => {
  const response = {
    output: [
      {
        type: 'function_call',
        name: 'submit_review',
        arguments:
          '{"issues":{"correctness":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"security":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"reliability":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"performance":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"architecture":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"api_design":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"cross_platform":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"tests":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}],"documentation":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":""}]},"verdict":"pass"}',
      },
    ],
  };
  expect(
    parseProviderResult(response, { tool_choice: { name: 'submit_review' }, tools: [] }, false)
      .verdict,
  ).toBe('pass');
});
