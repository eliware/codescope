import { createReviewSession } from '../../src/review/create-session.mjs';

test('creates a provider request and an abort controller', () => {
  const result = createReviewSession({
    prompt: {
      input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
      tools: [],
    },
    combined: 'source',
    model: 'gpt-5.6-luna',
  });
  expect(result.request.model).toBe('gpt-5.6-luna');
  expect(result.request.input[0].content[0].text).toContain('source');
  expect(result.controller).toBeInstanceOf(AbortController);
});
