import { parseCombinedToolResponse } from '../../src/response/combined-parser.mjs';

test('combines one review and suggestion call', () => {
  const issues = {
    correctness: [
      {
        severity: 'P3',
        location: 'none',
        issue: 'No issues found.',
        ignore_example: '// codescope ignore: no issue is present.',
      },
    ],
  };
  const suggestions = {
    correctness: [
      {
        location: 'none',
        suggestion: 'No suggestions found.',
        rationale: '',
        ignore_example: '// codescope ignore: no suggestion is present.',
      },
    ],
  };
  expect(
    parseCombinedToolResponse(
      {
        output: [
          {
            type: 'function_call',
            name: 'submit_review',
            arguments: JSON.stringify({ issues, verdict: 'pass' }),
          },
          {
            type: 'function_call',
            name: 'submit_suggestions',
            arguments: JSON.stringify({ suggestions }),
          },
        ],
      },
      ['correctness'],
      ['correctness'],
    ),
  ).toEqual({ issues, suggestions, verdict: 'pass' });
});
