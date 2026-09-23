import { REVIEW_CATEGORIES } from '../prompts/categories.mjs';

export const suggestionCategories = {
  refactor: ['architecture'], architecture: ['architecture'], 'new-features': ['new-features'],
  tests: ['tests'], security: ['security'], performance: ['performance'], reliability: ['reliability'],
  'api-design': ['api_design'], 'cross-platform': ['cross_platform'], dependencies: ['reliability'],
  observability: ['reliability'], accessibility: ['correctness'], 'quick-wins': REVIEW_CATEGORIES,
  prioritize: REVIEW_CATEGORIES,
};
