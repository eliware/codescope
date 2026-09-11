import { baseRequest } from '../../src/prompts/request-envelope.mjs';

test('defines the shared Responses request envelope', () => {
  expect(baseRequest.reasoning.effort).toBe('none');
  expect(baseRequest.parallel_tool_calls).toBe(false);
});
