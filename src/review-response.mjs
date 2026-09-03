const responseError = (message, cause) =>
  Object.assign(new Error(message, { cause }), { code: 'INVALID_RESPONSE' });

const exactKeys = (value, keys) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === keys.length &&
  Object.keys(value).every((key) => keys.includes(key));

const toolCategories = (prompt, field) => Object.keys(
  prompt?.tools?.[0]?.parameters?.properties?.[field]?.properties ?? {},
);

export function isValidSuggestionResult(result, prompt) {
  const categories = toolCategories(prompt, 'suggestions');
  return result && typeof result === 'object' && exactKeys(result, ['suggestions']) &&
    result.suggestions && typeof result.suggestions === 'object' && !Array.isArray(result.suggestions) &&
    Object.keys(result.suggestions).length === categories.length &&
    Object.keys(result.suggestions).every((category) => categories.includes(category)) &&
    categories.every((category) => Array.isArray(result.suggestions[category]) && result.suggestions[category].length >= 1 &&
      result.suggestions[category].every((item) => item && exactKeys(item, ['location', 'suggestion', 'rationale', 'ignore_example']) &&
        ['location', 'suggestion', 'rationale', 'ignore_example'].every((key) => typeof item[key] === 'string')));
}

export function isValidReviewResult(result, prompt) {
  const categories = toolCategories(prompt, 'issues');
  return result && typeof result === 'object' && exactKeys(result, ['issues', 'verdict']) &&
    result.issues && typeof result.issues === 'object' && !Array.isArray(result.issues) &&
    Object.keys(result.issues).length === categories.length &&
    Object.keys(result.issues).every((category) => categories.includes(category)) &&
    categories.every((category) => Array.isArray(result.issues[category]) && result.issues[category].length >= 1 &&
      result.issues[category].every((issue) => issue && exactKeys(issue, ['severity', 'location', 'issue', 'ignore_example']) &&
        ['P0', 'P1', 'P2', 'P3'].includes(issue.severity) &&
        ['location', 'issue', 'ignore_example'].every((key) => typeof issue[key] === 'string'))) &&
    ['pass', 'block'].includes(result.verdict);
}

export function parseReviewToolResponse(response, toolName = 'submit_review', categories) {
  // codescope ignore: profile-generated category names are intentionally accepted so scoped tools expose exactly their requested schema.
  if (!['submit_review', 'submit_suggestions'].includes(toolName))
    throw new Error(`Unsupported Codescope tool: ${toolName}`);
  const allCategories = [
    'correctness',
    'security',
    'reliability',
    'performance',
    'architecture',
    'api_design',
    'tests',
    'documentation',
  ];
  const suggestionCategories = [...allCategories, 'new-features'];
  const expectedCategories =
    categories ?? (toolName === 'submit_suggestions' ? suggestionCategories : allCategories);
  if (
    !Array.isArray(expectedCategories) ||
    expectedCategories.length === 0 ||
    expectedCategories.some((category) => typeof category !== 'string') ||
    new Set(expectedCategories).size !== expectedCategories.length
  )
    throw new Error('Response categories must be a nonempty unique string array');
  const calls = (Array.isArray(response?.output) ? response.output : []).filter(
    (item) => item?.type === 'function_call' && item.name === toolName,
  );
  if (calls.length !== 1 || typeof calls[0].arguments !== 'string')
    throw responseError(`OpenAI response did not contain exactly one ${toolName} tool call`);
  let result;
  try {
    result = JSON.parse(calls[0].arguments);
  } catch (cause) {
    throw responseError(`OpenAI ${toolName} tool arguments were not valid JSON`, cause);
  }
  if (toolName === 'submit_suggestions') {
    if (!isValidSuggestionResult(result, { tools: [{ parameters: { properties: { suggestions: { properties: Object.fromEntries(expectedCategories.map((category) => [category, {}])) } } } }] }))
      throw responseError('OpenAI submit_suggestions returned an invalid suggestions result');
    return result;
  }
  // codescope ignore: submit_suggestions has a distinct payload and returns immediately after its own complete validation; review-only issues checks must not apply.
  if (!isValidReviewResult(result, { tools: [{ parameters: { properties: { issues: { properties: Object.fromEntries(expectedCategories.map((category) => [category, {}])) } } } }] }))
    throw responseError('OpenAI submit_review returned an invalid review result');
  return result;
}

export function parseCombinedToolResponse(response, reviewCategories, suggestionCategories) {
  const submitted = (name) =>
    (Array.isArray(response?.output) ? response.output : []).filter(
      (item) => item?.type === 'function_call' && item.name === name,
    );
  if (submitted('submit_review').length !== 1 || submitted('submit_suggestions').length !== 1) {
    const error = new Error(
      'OpenAI response did not contain exactly one review and suggestion tool call',
    );
    error.code = 'INVALID_RESPONSE';
    throw error;
  }
  const review = parseReviewToolResponse(response, 'submit_review', reviewCategories);
  const suggestions = parseReviewToolResponse(response, 'submit_suggestions', suggestionCategories);
  return {
    issues: review.issues,
    suggestions: suggestions.suggestions,
    verdict: review.verdict,
  };
}
