import { parseCombinedToolResponse, parseReviewToolResponse } from '../src/review-response.mjs';

test('rejects unsupported tool names', () => {
  expect(() => parseReviewToolResponse({ output: [] }, 'other_tool')).toThrow(
    'Unsupported Codescope tool',
  );
});

test('rejects invalid category configurations and output shapes', () => {
  expect(() => parseReviewToolResponse(response({}), 'submit_review', [])).toThrow(
    'nonempty unique string array',
  );
  expect(() => parseReviewToolResponse(response({}), 'submit_review', ['tests', 'tests'])).toThrow(
    'nonempty unique string array',
  );
  expect(() => parseReviewToolResponse({ output: {} })).toThrow(
    'exactly one submit_review tool call',
  );
});

const response = (value) => ({
  output: [{ type: 'function_call', name: 'submit_review', arguments: JSON.stringify(value) }],
});
const emptyIssues = Object.fromEntries(
  [
    'correctness',
    'security',
    'reliability',
    'performance',
    'architecture',
    'api_design',
    'tests',
    'documentation',
  ].map((category) => [
    category,
    [{ severity: 'P3', location: 'none', issue: 'No issues found.', ignore_example: '' }],
  ]),
);
const emptySuggestions = Object.fromEntries(
  [...Object.keys(emptyIssues), 'new-features'].map((category) => [
    category,
    [{ location: 'none', suggestion: 'No suggestions found.', rationale: '', ignore_example: '' }],
  ]),
);

test('parses valid tool responses', () => {
  expect(
    parseReviewToolResponse(
      response({
        verdict: 'block',
        issues: {
          ...emptyIssues,
          correctness: [
            {
              severity: 'P1',
              location: 'a.mjs:1',
              issue: 'bad',
              ignore_example: 'none',
            },
          ],
        },
      }),
    ),
  ).toHaveProperty('verdict', 'block');
});
test('normalizes blocking findings to a block verdict', () => {
  const result = parseReviewToolResponse(
    response({
      verdict: 'pass',
      issues: {
        ...emptyIssues,
        correctness: [
          { severity: 'P1', location: 'a.mjs:1', issue: 'bad', ignore_example: 'none' },
        ],
      },
    }),
  );
  expect(result.verdict).toBe('block');
});
test('normalizes scoped blocking findings without documentation', () => {
  const result = parseReviewToolResponse(
    response({
      verdict: 'pass',
      issues: {
        correctness: [{ severity: 'P1', location: 'a.mjs:1', issue: 'bad', ignore_example: '' }],
      },
    }),
    'submit_review',
    ['correctness'],
  );
  expect(result.verdict).toBe('block');
});
test('parses the combined review and suggestion response', () => {
  const result = parseCombinedToolResponse(
    {
      output: [
        {
          type: 'function_call',
          name: 'submit_review',
          arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
        },
        {
          type: 'function_call',
          name: 'submit_suggestions',
          arguments: JSON.stringify({ suggestions: emptySuggestions }),
        },
      ],
    },
    Object.keys(emptyIssues),
    [...Object.keys(emptyIssues), 'new-features'],
  );
  expect(result).toEqual({
    issues: emptyIssues,
    suggestions: emptySuggestions,
    verdict: 'pass',
  });
});
test('rejects missing or duplicate combined tool calls', () => {
  const review = {
    type: 'function_call',
    name: 'submit_review',
    arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
  };
  expect(() =>
    parseCombinedToolResponse(
      { output: [review] },
      Object.keys(emptyIssues),
      Object.keys(emptyIssues),
    ),
  ).toThrow(/exactly one/);
  expect(() =>
    parseCombinedToolResponse(
      {
        output: [
          review,
          review,
          { type: 'function_call', name: 'submit_suggestions', arguments: '{}' },
        ],
      },
      Object.keys(emptyIssues),
      Object.keys(emptyIssues),
    ),
  ).toThrow(/exactly one/);
});

test('rejects malformed calls, JSON, and review results', () => {
  for (const value of [
    undefined,
    {},
    { output: [] },
    { output: [{ type: 'function_call', name: 'other', arguments: '{}' }] },
    { output: [{ type: 'function_call', name: 'submit_review', arguments: 1 }] },
  ])
    expect(() => parseReviewToolResponse(value)).toThrow('exactly one');
  expect(() =>
    parseReviewToolResponse({
      output: [{ type: 'function_call', name: 'submit_review', arguments: '{' }],
    }),
  ).toThrow('valid JSON');
  for (const result of [
    null,
    1,
    {},
    { issues: [], verdict: 'bad' },
    { issues: [{}], verdict: 'pass' },
    {
      issues: [{ severity: 'P9', location: 'x', issue: 'x', ignore_example: 'x' }],
      verdict: 'pass',
    },
    { issues: [{ severity: 'P1', location: 1, issue: 'x', ignore_example: 'x' }], verdict: 'pass' },
    { issues: [{ severity: 'P1', location: 'x', issue: 1, ignore_example: 'x' }], verdict: 'pass' },
    { issues: [{ severity: 'P1', location: 'x', issue: 'x', ignore_example: 1 }], verdict: 'pass' },
  ])
    expect(() => parseReviewToolResponse(response(result))).toThrow('invalid review result');
});

test('rejects malformed suggestion payloads', () => {
  for (const suggestions of [
    null,
    [],
    {},
    { correctness: [] },
    { correctness: [{}] },
    { correctness: [{ location: 'x', suggestion: 1, rationale: 'x' }] },
    { correctness: [{ location: 'x', suggestion: 'x', rationale: 1 }] },
  ])
    expect(() =>
      parseReviewToolResponse(
        {
          output: [
            {
              type: 'function_call',
              name: 'submit_suggestions',
              arguments: JSON.stringify({ suggestions }),
            },
          ],
        },
        'submit_suggestions',
        ['correctness'],
      ),
    ).toThrow('invalid suggestions');
});

test('rejects scoped review category mismatches and invalid verdicts', () => {
  expect(() =>
    parseReviewToolResponse(response({ issues: emptyIssues, verdict: 'pass' }), 'submit_review', [
      'correctness',
    ]),
  ).toThrow('invalid review result');
  expect(() =>
    parseReviewToolResponse(
      response({ issues: { correctness: emptyIssues.correctness }, verdict: 'unknown' }),
      'submit_review',
      ['correctness'],
    ),
  ).toThrow('invalid review');
});

test('uses the new-features category for unscoped suggestion responses', () => {
  const suggestions = Object.fromEntries(
    [...Object.keys(emptyIssues), 'new-features'].map((category) => [
      category,
      [{ location: 'none', suggestion: 'No suggestions found.', rationale: '', ignore_example: '' }],
    ]),
  );
  expect(
    parseReviewToolResponse(
      { output: [{ type: 'function_call', name: 'submit_suggestions', arguments: JSON.stringify({ suggestions }) }] },
      'submit_suggestions',
    ).suggestions['new-features'],
  ).toHaveLength(1);
});

test('accepts a valid scoped review and ignores unrelated output items', () => {
  expect(() =>
    parseCombinedToolResponse(undefined, Object.keys(emptyIssues), ['correctness']),
  ).toThrow('exactly one');
  const scoped = parseReviewToolResponse(
    response({ issues: { correctness: emptyIssues.correctness }, verdict: 'pass' }),
    'submit_review',
    ['correctness'],
  );
  expect(scoped.verdict).toBe('pass');
  const combined = parseCombinedToolResponse(
    {
      output: [
        null,
        {
          type: 'function_call',
          name: 'submit_review',
          arguments: JSON.stringify({ issues: emptyIssues, verdict: 'pass' }),
        },
        {
          type: 'function_call',
          name: 'submit_suggestions',
          arguments: JSON.stringify({ suggestions: emptySuggestions }),
        },
      ],
    },
    Object.keys(emptyIssues),
    [...Object.keys(emptyIssues), 'new-features'],
  );
  expect(combined.verdict).toBe('pass');
});

test('does not treat a noncanonical placeholder as empty', () => {
  const issues = Object.fromEntries(
    Object.keys(emptyIssues).map((category) => [category, emptyIssues[category]]),
  );
  issues.correctness = [
    { severity: 'P1', location: 'none', issue: 'No issues found.', ignore_example: '' },
  ];
  expect(parseReviewToolResponse(response({ issues, verdict: 'pass' })).verdict).toBe('block');
});
