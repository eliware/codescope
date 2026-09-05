import { SUGGESTION_CATEGORIES } from './categories.mjs';

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
            ignore_example: {
              type: 'string',
              description: 'A complete copy-pasteable // codescope ignore: ... comment.',
            },
          },
          required: ['location', 'suggestion', 'rationale', 'ignore_example'],
        },
      },
    },
  };
}

export const suggestionTool = createSuggestionTool();
