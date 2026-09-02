import { parseReviewToolResponse } from '../src/review-response.mjs';

const response = (value) => ({ output: [{ type: 'function_call', name: 'submit_review', arguments: JSON.stringify(value) }] });

test('parses valid tool responses', () => {
  expect(parseReviewToolResponse(response({ verdict: 'block', issues: [{ severity: 'P1', location: 'a.mjs:1', issue: 'bad', ignore_example: 'none' }] }))).toHaveProperty('verdict', 'block');
});

test('rejects malformed calls, JSON, and review results', () => {
  for (const value of [undefined, {}, { output: [] }, { output: [{ type: 'function_call', name: 'other', arguments: '{}' }] }, { output: [{ type: 'function_call', name: 'submit_review', arguments: 1 }] }])
    expect(() => parseReviewToolResponse(value)).toThrow('exactly one');
  expect(() => parseReviewToolResponse({ output: [{ type: 'function_call', name: 'submit_review', arguments: '{' }] })).toThrow('valid JSON');
  for (const result of [null, 1, {}, { issues: [], verdict: 'bad' }, { issues: [{}], verdict: 'pass' }, { issues: [{ severity: 'P9', location: 'x', issue: 'x', ignore_example: 'x' }], verdict: 'pass' }, { issues: [{ severity: 'P1', location: 1, issue: 'x', ignore_example: 'x' }], verdict: 'pass' }, { issues: [{ severity: 'P1', location: 'x', issue: 1, ignore_example: 'x' }], verdict: 'pass' }, { issues: [{ severity: 'P1', location: 'x', issue: 'x', ignore_example: 1 }], verdict: 'pass' }])
    expect(() => parseReviewToolResponse(response(result))).toThrow('invalid review result');
});
