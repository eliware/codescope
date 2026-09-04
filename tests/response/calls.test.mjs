import { getFunctionCalls, responseError } from '../../src/response/calls.mjs';

test('extracts named function calls and tags response errors', () => {
  expect(getFunctionCalls({ output: [
    { type: 'function_call', name: 'submit_review' },
    { type: 'message', name: 'submit_review' },
    { type: 'function_call', name: 'submit_suggestions' },
  ] }, 'submit_review')).toHaveLength(1);
  expect(getFunctionCalls({}, 'submit_review')).toEqual([]);
  expect(responseError('bad').code).toBe('INVALID_RESPONSE');
});
