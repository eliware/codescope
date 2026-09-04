import { createReviewProfiles } from '../../src/prompts/review-profiles.mjs';

test('builds the focused review profile prompts', () => {
  const profiles = createReviewProfiles({
    profilePrompt: (focus) => ({ focus }),
    reviewTool: { name: 'submit_review' },
  });
  expect(Object.keys(profiles)).toEqual(['prompt', 'mdPrompt', 'codeTestsDocsPrompt', 'refactorPrompt', 'reviewTool']);
  expect(profiles.mdPrompt.focus).toContain('documentation inconsistencies');
  expect(profiles.refactorPrompt.focus).toContain('monolithic-file');
});
