import * as prompt from '../src/prompt.mjs';
test('public prompt barrel exports profile prompts', () => {
  expect(typeof prompt.prompt).toBe('object');
  expect(typeof prompt.createReviewTool).toBe('function');
});
