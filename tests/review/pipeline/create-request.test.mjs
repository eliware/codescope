import { createRequest } from '../../../src/review/pipeline/create-request.mjs';

test('passes review options into request construction', () => {
  const prompt = { input: [
    { role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] },
    { role: 'user', content: [{ type: 'input_text', text: 'user' }] },
  ] };
  expect(createRequest({ prompt, model: 'gpt-5.6-sol' }, 'context')).toHaveProperty('request');
});
