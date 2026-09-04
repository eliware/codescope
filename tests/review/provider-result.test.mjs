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

test('routes suggestion and combined tool responses', () => {
  const review = { output: [{ type: 'function_call', name: 'submit_review', arguments: JSON.stringify({ issues: { correctness: [{ severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' }] }, verdict: 'pass' }) }] };
  const suggestion = { output: [{ type: 'function_call', name: 'submit_suggestions', arguments: JSON.stringify({ suggestions: { correctness: [{ location: 'none', suggestion: 'No suggestions found.', rationale: '', ignore_example: '' }] } }) }] };
  const suggestionRequest = { tool_choice: { name: 'submit_suggestions' }, tools: [{ name: 'submit_suggestions', parameters: { properties: { suggestions: { properties: { correctness: {} } } } } }] };
  expect(parseProviderResult(suggestion, suggestionRequest, false).suggestions).toBeDefined();
  const combined = { output: [
    ...review.output,
    ...suggestion.output,
  ] };
  const combinedRequest = { tools: [{ name: 'submit_review', parameters: { properties: { issues: { properties: { correctness: {} } } } } }, suggestionRequest.tools[0]] };
  expect(parseProviderResult(combined, combinedRequest, true).verdict).toBe('pass');
});
