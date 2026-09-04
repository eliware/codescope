import { getFunctionCalls, responseError } from './calls.mjs';
import { exactKeys } from './exact-keys.mjs';
import { validateCategories } from './categories.mjs';

export function parseUnifiedToolResponse(response, categories) {
  const calls = getFunctionCalls(response, 'submit_unified_review');
  if (calls.length !== 1 || typeof calls[0].arguments !== 'string')
    throw responseError(
      'OpenAI response did not contain exactly one submit_unified_review tool call',
    );
  let result;
  try {
    result = JSON.parse(calls[0].arguments);
  } catch (cause) {
    throw responseError('OpenAI submit_unified_review returned invalid JSON', cause);
  }
  let expected;
  try {
    expected = validateCategories(categories ?? []);
  } catch (cause) {
    throw responseError('OpenAI submit_unified_review returned an invalid result', cause);
  }
  if (
    result?.findings &&
    typeof result.findings === 'object' &&
    !exactKeys(result.findings, expected)
  )
    throw responseError('OpenAI submit_unified_review returned invalid categories');
  if (
    result?.findings &&
    typeof result.findings === 'object' &&
    exactKeys(result.findings, expected) &&
    ['pass', 'block'].includes(result.verdict) &&
    !isValidUnifiedResult(result, expected)
  )
    throw responseError('OpenAI submit_unified_review returned invalid categories');
  if (!isValidUnifiedResult(result, expected))
    throw responseError('OpenAI submit_unified_review returned an invalid result');
  return result;
}

export function isValidUnifiedResult(result, expected) {
  if (
    !expected.length ||
    !result ||
    typeof result !== 'object' ||
    !result.findings ||
    typeof result.findings !== 'object' ||
    Array.isArray(result.findings) ||
    Object.getPrototypeOf(result.findings) !== Object.prototype ||
    Object.keys(result).sort().join() !== 'findings,verdict' ||
    !['pass', 'block'].includes(result.verdict)
  )
    return false;
  if (!exactKeys(result.findings, expected)) return false;
  const invalidCategory = expected.some((category) => {
    const items = result.findings[category];
    if (!Array.isArray(items)) return true;
    return items.some((item) => {
      if (!item || typeof item !== 'object') return true;
      if (
        !exactKeys(item, [
          'severity',
          'location',
          'finding',
          'recommendation',
          'rationale',
          'ignore_example',
        ])
      )
        return true;
      if (!['P0', 'P1', 'P2', 'P3'].includes(item.severity)) return true;
      return ['location', 'finding', 'recommendation', 'rationale', 'ignore_example'].some((key) =>
        key === 'ignore_example'
          ? !/^\/\/ codescope ignore: [^\r\n]+$/u.test(item[key])
          : typeof item[key] !== 'string',
      );
    });
  });
  return !invalidCategory;
}
