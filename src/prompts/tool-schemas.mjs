import { REVIEW_CATEGORIES, SUGGESTION_CATEGORIES } from './categories.mjs';

export function createReviewTool(categories = REVIEW_CATEGORIES) {
  return {
    type: 'function',
    name: 'submit_review',
    description: 'Return the complete Codescope review result.',
    strict: true,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        issues: {
          type: 'object',
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              { type: 'array', minItems: 1, items: { $ref: '#/$defs/issue' } },
            ]),
          ),
          required: [...categories],
        },
        verdict: { type: 'string', enum: ['pass', 'block'] },
      },
      required: ['issues', 'verdict'],
      $defs: {
        issue: {
          type: 'object',
          additionalProperties: false,
          properties: {
            severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
            location: { type: 'string' },
            issue: { type: 'string' },
            ignore_example: { type: 'string' },
          },
          required: ['severity', 'location', 'issue', 'ignore_example'],
        },
      },
    },
  };
}

export const reviewTool = createReviewTool();

export function createSuggestionTool(categories = SUGGESTION_CATEGORIES) {
  return {
    type: 'function',
    name: 'submit_suggestions',
    description: 'Return concise actionable improvement suggestions.',
    strict: true,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        suggestions: {
          type: 'object',
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              { type: 'array', minItems: 1, items: { $ref: '#/$defs/suggestion' } },
            ]),
          ),
          required: [...categories],
        },
      },
      required: ['suggestions'],
      $defs: {
        suggestion: {
          type: 'object',
          additionalProperties: false,
          properties: {
            location: { type: 'string' },
            suggestion: { type: 'string' },
            rationale: { type: 'string' },
            ignore_example: { type: 'string' },
          },
          required: ['location', 'suggestion', 'rationale', 'ignore_example'],
        },
      },
    },
  };
}

export const suggestionTool = createSuggestionTool();
