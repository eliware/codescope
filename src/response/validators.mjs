import { exactKeys } from './exact-keys.mjs';

const toolCategories = (prompt, field) =>
  Object.keys(prompt?.tools?.[0]?.parameters?.properties?.[field]?.properties ?? {});
const validIgnore = (value) =>
  typeof value === 'string' && /^\/\/ codescope ignore: [^\r\n]+$/u.test(value);

export function isValidSuggestionResult(result, prompt) {
  const categories = toolCategories(prompt, 'suggestions');
  return (
    result &&
    typeof result === 'object' &&
    exactKeys(result, ['suggestions']) &&
    result.suggestions &&
    typeof result.suggestions === 'object' &&
    !Array.isArray(result.suggestions) &&
    Object.keys(result.suggestions).length === categories.length &&
    Object.keys(result.suggestions).every((category) => categories.includes(category)) &&
    categories.every(
      (category) =>
        Array.isArray(result.suggestions[category]) &&
        result.suggestions[category].every(
          (item) =>
            item &&
            exactKeys(item, ['location', 'suggestion', 'rationale', 'ignore_example']) &&
            ['location', 'suggestion', 'rationale', 'ignore_example'].every(
              (key) =>
                typeof item[key] === 'string' &&
                (key !== 'ignore_example' || validIgnore(item[key])),
            ),
        ),
    )
  );
}

export function isValidReviewResult(result, prompt) {
  const categories = toolCategories(prompt, 'issues');
  return (
    result &&
    typeof result === 'object' &&
    exactKeys(result, ['issues', 'verdict']) &&
    result.issues &&
    typeof result.issues === 'object' &&
    !Array.isArray(result.issues) &&
    Object.keys(result.issues).length === categories.length &&
    Object.keys(result.issues).every((category) => categories.includes(category)) &&
    categories.every(
      (category) =>
        Array.isArray(result.issues[category]) &&
        result.issues[category].every(
          (issue) =>
            issue &&
            exactKeys(issue, ['severity', 'location', 'issue', 'ignore_example']) &&
            ['P0', 'P1', 'P2', 'P3', 'none'].includes(issue.severity) &&
            ['location', 'issue', 'ignore_example'].every(
              (key) =>
                typeof issue[key] === 'string' &&
                (key !== 'ignore_example' || validIgnore(issue[key])),
            ),
        ),
    ) &&
    ['pass', 'block'].includes(result.verdict)
  );
}
