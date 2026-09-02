export function parseReviewToolResponse(response, toolName = 'submit_review', categories) {
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
  const expectedCategories = categories ?? allCategories;
  const calls = (response?.output ?? []).filter(
    (item) => item?.type === 'function_call' && item.name === toolName,
  );
  if (calls.length !== 1 || typeof calls[0].arguments !== 'string')
    throw new Error(`OpenAI response did not contain exactly one ${toolName} tool call`);
  let result;
  try {
    result = JSON.parse(calls[0].arguments);
  } catch (cause) {
    throw new Error(`OpenAI ${toolName} tool arguments were not valid JSON`, { cause });
  }
  if (toolName === 'submit_suggestions') {
    if (
      !result ||
      typeof result !== 'object' ||
      !result.suggestions ||
      typeof result.suggestions !== 'object' ||
      Array.isArray(result.suggestions) ||
      Object.keys(result.suggestions).some((category) => !expectedCategories.includes(category)) ||
      expectedCategories.some(
        (category) =>
          !Array.isArray(result.suggestions[category]) ||
          result.suggestions[category].some(
            (item) =>
              !item ||
              typeof item !== 'object' ||
              typeof item.location !== 'string' ||
              typeof item.suggestion !== 'string' ||
              typeof item.rationale !== 'string',
          ),
      )
    )
      throw new Error('OpenAI submit_suggestions returned an invalid suggestions result');
    return result;
  }
  if (categories && toolName === 'submit_review') {
    if (
      Object.keys(result.issues).some((category) => !categories.includes(category)) ||
      categories.some((category) => !Array.isArray(result.issues[category]))
    )
      throw new Error('OpenAI submit_review returned an invalid category result');
  }
  if (
    !result ||
    typeof result !== 'object' ||
    !result.issues ||
    typeof result.issues !== 'object' ||
    Array.isArray(result.issues) ||
    Object.keys(result.issues).some((category) => !expectedCategories.includes(category)) ||
    expectedCategories.some((category) => !Array.isArray(result.issues[category])) ||
    !['pass', 'block'].includes(result.verdict) ||
    expectedCategories.some((category) =>
      result.issues[category].some(
        (issue) =>
          !issue ||
          typeof issue !== 'object' ||
          !['P0', 'P1', 'P2', 'P3'].includes(issue.severity) ||
          typeof issue.location !== 'string' ||
          typeof issue.issue !== 'string' ||
          typeof issue.ignore_example !== 'string',
      ),
    )
  )
    throw new Error('OpenAI submit_review returned an invalid review result');
  return result;
}
