import { parseProviderResult } from '../../src/review/provider-result.mjs';

test('preserves malformed and text-only provider responses', () => {
  expect(parseProviderResult({ output_text: '{"verdict":"pass"' }, {})).toEqual({
    raw_response: '{"verdict":"pass"',
    verdict: 'block',
  });
  expect(parseProviderResult({ output_text: 'The verdict is "verdict":"pass".' }, {})).toEqual({
    raw_response: 'The verdict is "verdict":"pass".',
    verdict: 'block',
  });
  expect(parseProviderResult({ output: [] }, {})).toEqual({ raw_response: '', verdict: 'block' });
  expect(parseProviderResult({ output_text: 'null' }, {})).toEqual({
    raw_response: 'null',
    verdict: 'block',
  });
  expect(parseProviderResult({ output_text: '{"verdict":"block"}' }, {})).toEqual({
    verdict: 'block',
  });
  expect(
    parseProviderResult(
      {
        output: [{ type: 'function_call', name: 'submit_review', arguments: '{"verdict":"pass"}' }],
      },
      { tool_choice: { name: 'submit_review' } },
    ),
  ).toEqual({ verdict: 'pass' });
});

test('routes a single review tool response through the response parser', () => {
  const response = {
    output: [
      {
        type: 'function_call',
        name: 'submit_review',
        arguments:
          '{"issues":{"correctness":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"security":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"reliability":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"performance":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"architecture":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"api_design":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"cross_platform":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"tests":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}],"documentation":[{"severity":"P3","location":"none","issue":"No issues found.","ignore_example":"// codescope ignore: no issue is present."}]},"verdict":"pass"}',
      },
    ],
  };
  expect(
    parseProviderResult(
      response,
      {
        tool_choice: { name: 'submit_review' },
        tools: [
          {
            name: 'submit_review',
            parameters: {
              properties: {
                issues: {
                  properties: Object.fromEntries(
                    [
                      'correctness',
                      'security',
                      'reliability',
                      'performance',
                      'architecture',
                      'api_design',
                      'cross_platform',
                      'tests',
                      'documentation',
                    ].map((category) => [category, {}]),
                  ),
                },
              },
            },
          },
        ],
      },
      false,
    ).verdict,
  ).toBe('pass');
});

test('routes suggestion and combined tool responses', () => {
  const review = {
    output: [
      {
        type: 'function_call',
        name: 'submit_review',
        arguments: JSON.stringify({
          issues: {
            correctness: [
              {
                severity: 'P3',
                location: 'none',
                issue: 'No issues found.',
                ignore_example: '// codescope ignore: no issue is present.',
              },
            ],
          },
          verdict: 'pass',
        }),
      },
    ],
  };
  const suggestion = {
    output: [
      {
        type: 'function_call',
        name: 'submit_suggestions',
        arguments: JSON.stringify({
          suggestions: {
            correctness: [
              {
                location: 'none',
                suggestion: 'No suggestions found.',
                rationale: '',
                ignore_example: '// codescope ignore: no suggestion is present.',
              },
            ],
          },
        }),
      },
    ],
  };
  const suggestionRequest = {
    tool_choice: { name: 'submit_suggestions' },
    tools: [
      {
        name: 'submit_suggestions',
        parameters: { properties: { suggestions: { properties: { correctness: {} } } } },
      },
    ],
  };
  expect(parseProviderResult(suggestion, suggestionRequest, false).suggestions).toBeDefined();
  const combined = { output: [...review.output, ...suggestion.output] };
  const combinedRequest = {
    tools: [
      {
        name: 'submit_review',
        parameters: { properties: { issues: { properties: { correctness: {} } } } },
      },
      suggestionRequest.tools[0],
    ],
  };
  expect(parseProviderResult(combined, combinedRequest, true).verdict).toBe('pass');
});

test('routes the unified all-profile response through one tool', () => {
  const result = {
    findings: {
      correctness: [
        {
          severity: 'P2',
          location: 'src/a.mjs:1',
          finding: 'Issue',
          recommendation: 'Fix',
          rationale: 'Reason',
          ignore_example: '// codescope ignore: Issue is intentional.',
        },
      ],
    },
    verdict: 'pass',
  };
  const response = {
    output: [
      { type: 'function_call', name: 'submit_unified_review', arguments: JSON.stringify(result) },
    ],
  };
  const request = {
    tool_choice: { type: 'function', name: 'submit_unified_review' },
    tools: [
      {
        name: 'submit_unified_review',
        parameters: { properties: { findings: { properties: { correctness: {} } } } },
      },
    ],
  };
  expect(parseProviderResult(response, request, true)).toEqual(result);
});
