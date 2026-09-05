import { REVIEW_CATEGORIES } from './categories.mjs';

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
            severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3', 'none'] },
            location: { type: 'string' },
            issue: { type: 'string' },
            ignore_example: {
              type: 'string',
              description: 'A complete copy-pasteable // codescope ignore: ... comment.',
            },
          },
          required: ['severity', 'location', 'issue', 'ignore_example'],
        },
      },
    },
  };
}

export const reviewTool = createReviewTool();
