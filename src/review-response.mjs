export function parseReviewToolResponse(response) {
  const calls = (response?.output ?? []).filter(
    (item) => item?.type === 'function_call' && item.name === 'submit_review',
  );
  if (calls.length !== 1 || typeof calls[0].arguments !== 'string')
    throw new Error('OpenAI response did not contain exactly one submit_review tool call');
  let result;
  try {
    result = JSON.parse(calls[0].arguments);
  } catch (cause) {
    throw new Error('OpenAI submit_review tool arguments were not valid JSON', { cause });
  }
  if (
    !result ||
    typeof result !== 'object' ||
    !Array.isArray(result.issues) ||
    !['pass', 'block'].includes(result.verdict) ||
    result.issues.some(
      (issue) =>
        !issue ||
        typeof issue !== 'object' ||
        !['P0', 'P1', 'P2', 'P3'].includes(issue.severity) ||
        typeof issue.location !== 'string' ||
        typeof issue.issue !== 'string' ||
        typeof issue.ignore_example !== 'string',
    )
  )
    throw new Error('OpenAI submit_review returned an invalid review result');
  return result;
}
