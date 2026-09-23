import { validatePromptShape } from '../../src/review/prompt-shape.mjs';

test('accepts one developer input-text message', () => {
  expect(() => validatePromptShape({
    input: [{ role: 'developer', content: [{ type: 'input_text', text: 'review' }] }],
  })).not.toThrow();
});
