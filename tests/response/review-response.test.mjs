import {
  parseCombinedToolResponse,
  parseResponseTool,
  parseReviewToolResponse,
  parseSuggestionToolResponse,
} from '../../src/response/review-response.mjs';

const response = (value, name = 'submit_review') => ({
  output: [{ type: 'function_call', name, arguments: JSON.stringify(value) }],
});
const issue = {
  severity: 'P3',
  location: 'none',
  issue: 'No issues found.',
  ignore_example: '// codescope ignore: no issue is present.',
};
const suggestion = {
  location: 'none',
  suggestion: 'No suggestions found.',
  rationale: '',
  ignore_example: '// codescope ignore: no suggestion is present.',
};
const issues = { correctness: [issue] };
const suggestions = { correctness: [suggestion] };

test('routes public review and suggestion adapters', () => {
  expect(
    parseReviewToolResponse(response({ issues, verdict: 'pass' }), 'submit_review', [
      'correctness',
    ]),
  ).toEqual({ issues, verdict: 'pass' });
  expect(
    parseResponseTool(response({ issues, verdict: 'pass' }), 'submit_review', ['correctness']),
  ).toEqual({ issues, verdict: 'pass' });
  expect(
    parseSuggestionToolResponse(response({ suggestions }, 'submit_suggestions'), ['correctness']),
  ).toEqual({ suggestions });
  expect(
    parseResponseTool(response({ suggestions }, 'submit_suggestions'), 'submit_suggestions', [
      'correctness',
    ]),
  ).toEqual({ suggestions });
  expect(() => parseReviewToolResponse({ output: [] }, 'unknown')).toThrow(/Unsupported/);
  expect(parseReviewToolResponse(response({ issues, verdict: 'pass' }), ['correctness'])).toEqual({
    issues,
    verdict: 'pass',
  });
  expect(() => parseReviewToolResponse(response({ issues, verdict: 'pass' }))).toThrow(
    /invalid review/,
  );
});

test('combines exactly one review and suggestion call', () => {
  expect(
    parseCombinedToolResponse(
      {
        output: [
          ...response({ issues, verdict: 'pass' }).output,
          ...response({ suggestions }, 'submit_suggestions').output,
        ],
      },
      ['correctness'],
      ['correctness'],
    ),
  ).toEqual({ issues, suggestions, verdict: 'pass' });
  expect(() => parseCombinedToolResponse({ output: [] }, ['correctness'], ['correctness'])).toThrow(
    /exactly one/,
  );
});

test('rejects invalid category declarations and malformed calls', () => {
  expect(() =>
    parseReviewToolResponse(response({ issues, verdict: 'pass' }), 'submit_review', []),
  ).toThrow(/nonempty/);
  expect(() =>
    parseReviewToolResponse(response({ issues, verdict: 'pass' }), 'submit_review', ['x', 'x']),
  ).toThrow(/nonempty/);
  expect(() =>
    parseReviewToolResponse({
      output: [{ type: 'function_call', name: 'submit_review', arguments: 1 }],
    }),
  ).toThrow(/exactly one/);
  expect(() =>
    parseReviewToolResponse({
      output: [{ type: 'function_call', name: 'submit_review', arguments: '{' }],
    }),
  ).toThrow(/valid JSON/);
});

test('rejects unsupported public tool names', () => {
  expect(() => parseReviewToolResponse(response({}), 'unsupported')).toThrow(/Unsupported/);
  expect(() => parseResponseTool(response({}), 'unsupported')).toThrow(/Unsupported/);
});

test('preserves the AI verdict and validates malformed payloads', () => {
  expect(
    parseReviewToolResponse(
      response({ issues: { correctness: [{ ...issue, severity: 'P1' }] }, verdict: 'pass' }),
      'submit_review',
      ['correctness'],
    ).verdict,
  ).toBe('pass');
  for (const value of [
    null,
    1,
    {},
    { issues: [], verdict: 'pass' },
    { issues: { correctness: [{}] }, verdict: 'pass' },
    { issues: { correctness: [issue] }, verdict: 'bad' },
  ])
    expect(() =>
      parseReviewToolResponse(response(value), 'submit_review', ['correctness']),
    ).toThrow(/invalid review/);
  for (const value of [null, [], {}, { correctness: [{ ...suggestion, rationale: 1 }] }])
    expect(() =>
      parseSuggestionToolResponse(response({ suggestions: value }, 'submit_suggestions'), [
        'correctness',
      ]),
    ).toThrow(/invalid suggestions/);
});

test('accepts the default suggestion categories', () => {
  const categories = [
    'correctness',
    'security',
    'reliability',
    'performance',
    'architecture',
    'api_design',
    'cross_platform',
    'tests',
    'documentation',
    'new-features',
  ];
  const suggestions = Object.fromEntries(categories.map((category) => [category, [suggestion]]));
  expect(
    parseSuggestionToolResponse(response({ suggestions }, 'submit_suggestions')).suggestions[
      'new-features'
    ],
  ).toHaveLength(1);
});

test('requires an explicit response tool name', () => {
  expect(() => parseResponseTool(response({ issues, verdict: 'pass' }), undefined, ['correctness']))
    .toThrow(/tool name is required/);
});

test('routes the unified review tool through the shared response entry point', () => {
  const unified = {
    findings: {
      correctness: [
        {
          severity: 'none',
          location: 'none',
          finding: 'No issues found.',
          recommendation: '',
          rationale: '',
          ignore_example: '// codescope ignore: no actionable finding',
        },
      ],
    },
    verdict: 'pass',
  };
  expect(
    parseResponseTool(response(unified, 'submit_unified_review'), 'submit_unified_review', [
      'correctness',
    ]),
  ).toEqual(unified);
});
