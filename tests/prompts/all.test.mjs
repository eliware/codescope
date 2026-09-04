import { createAllPrompt } from '../../src/prompts/all.mjs';

test('creates the comprehensive all-profile focus', () => {
  const result = createAllPrompt((focus) => ({ focus }));
  expect(result.focus).toContain('Review all supplied implementation');
  expect(result.focus).toContain('Cross Platform');
  expect(result.focus).toContain('No issues found.');
});
