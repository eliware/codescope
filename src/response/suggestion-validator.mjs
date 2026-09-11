import { exactKeys, toolCategories, validIgnore } from './validation-shared.mjs';

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
