import { exactKeys, toolCategories, validIgnore } from './validation-shared.mjs';

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
        result.issues[category].length > 0 &&
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
