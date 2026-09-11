import { REVIEW_CATEGORIES } from './categories.mjs';

export function createUnifiedTool(categories = REVIEW_CATEGORIES) {
  return {
    type: 'function',
    name: 'submit_unified_review',
    description:
      'Return one exhaustive consolidated CodeScope review. Enumerate every distinct actionable finding supported by the supplied evidence; never return a representative sample, shortlist, or only the highest-priority findings. Keep each item concise without reducing the total number of findings.',
    strict: true,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        findings: {
          type: 'object',
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              {
                type: 'array',
                minItems: 1,
                description:
                  'Complete exhaustive list of all distinct actionable findings supported by the supplied evidence. Do not return a sample or only the highest-priority items. Use exactly one none sentinel only when no actionable finding exists.',
                items: { $ref: '#/$defs/finding' },
              },
            ]),
          ),
          required: [...categories],
        },
        verdict: { type: 'string', enum: ['pass', 'block'] },
      },
      required: ['findings', 'verdict'],
      $defs: {
        finding: {
          type: 'object',
          additionalProperties: false,
          properties: {
            severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3', 'none'] },
            location: { type: 'string' },
            finding: { type: 'string' },
            recommendation: { type: 'string' },
            rationale: { type: 'string' },
            ignore_example: {
              type: 'string',
              description: 'A complete copy-pasteable // codescope ignore: ... comment.',
            },
          },
          required: [
            'severity',
            'location',
            'finding',
            'recommendation',
            'rationale',
            'ignore_example',
          ],
        },
      },
    },
  };
}
