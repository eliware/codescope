export const DEFAULT_REVIEW_CATEGORIES = [
  'correctness',
  'security',
  'reliability',
  'performance',
  'architecture',
  'api_design',
  'cross_platform',
  'tests',
  'documentation',
];

export const DEFAULT_SUGGESTION_CATEGORIES = [...DEFAULT_REVIEW_CATEGORIES, 'new-features'];

export function validateCategories(categories) {
  if (
    !Array.isArray(categories) ||
    categories.length === 0 ||
    categories.some((category) => typeof category !== 'string') ||
    new Set(categories).size !== categories.length
  )
    throw new Error('Response categories must be a nonempty unique string array');
  return categories;
}

export function categoryPrompt(categories, field) {
  return {
    tools: [{ parameters: { properties: { [field]: { properties: Object.fromEntries(categories.map((category) => [category, {}])) } } } }],
  };
}
