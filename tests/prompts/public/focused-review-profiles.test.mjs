import { codeTestsDocsPrompt, mdPrompt, prompt, refactorPrompt } from '../../../src/prompts/public/focused-review-profiles.mjs';

test('exposes focused review prompt products', () => {
  expect(refactorPrompt).toBeDefined();
  expect(mdPrompt).toBeDefined();
  expect(codeTestsDocsPrompt).toBeDefined();
  expect(prompt).toBeDefined();
});
