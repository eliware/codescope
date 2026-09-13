import { prepareReviewRequest } from '../../src/review/request-phase.mjs';

test('prepares a review request and applies model/custom prompt data', () => {
  const prompt = {
    model: 'gpt-5.6-luna',
    input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
    tools: [],
  };
  const request = prepareReviewRequest(prompt, 'source', 'gpt-5.6-sol', 'summarize');
  expect(request.model).toBe('gpt-5.6-sol');
  expect(request.text).toBeUndefined();
  expect(request.input[0].content[0].text).toContain('source');
});

test('appends additions in order to the final user message', () => {
  const prompt = {
    model: 'gpt-5.6-luna',
    input: [
      { role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] },
      { role: 'user', content: [{ type: 'input_text', text: 'Review this.' }] },
    ],
  };
  const request = prepareReviewRequest(prompt, 'source', undefined, undefined, [
    'first instruction',
    'second instruction',
  ]);
  expect(request.input.at(-1).content[0].text).toMatch(
    /Review this\.[\s\S]*first instruction[\s\S]*second instruction$/u,
  );
});

test('rejects an empty custom prompt', () => {
  const prompt = {
    input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }],
  };
  expect(() => prepareReviewRequest(prompt, 'source', undefined, '  ')).toThrow(/non-empty/);
});
