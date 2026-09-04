import { prepareReviewRequest } from '../../src/review/request-phase.mjs';

test('prepares a review request and applies model/custom prompt data', () => {
  const prompt = {
    model: 'gpt-5.6-luna',
    input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
    tools: [],
  };
  const request = prepareReviewRequest(prompt, 'source', 'gpt-5.6-sol', 'summarize');
  expect(request.model).toBe('gpt-5.6-sol');
  expect(request.text).toEqual({ format: { type: 'json_object' } });
  expect(request.input[0].content[0].text).toContain('source');
});
