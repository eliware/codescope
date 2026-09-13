import { defaultDeveloperText, profileReviewRules } from '../../src/prompts/guidance.mjs';

test('provides the shared developer guidance', () => {
  expect(defaultDeveloperText).toContain('ignore_example');
  expect(defaultDeveloperText).toContain('copy-paste-ready');
  expect(defaultDeveloperText).toContain('reconcile the cited implementation');
  expect(defaultDeveloperText).toContain('Do not recommend changes that are already present');
  expect(defaultDeveloperText).toContain('one-shot reviewer');
  expect(defaultDeveloperText).toContain('partial');
  expect(profileReviewRules).toContain('category sentinel');
});
