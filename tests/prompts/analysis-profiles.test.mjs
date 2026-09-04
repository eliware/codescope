import { createAnalysisProfiles } from '../../src/prompts/analysis-profiles.mjs';

test('creates priority and subject-analysis adapters', () => {
  const profiles = createAnalysisProfiles({
    profilePrompt: (focus, tool) => ({ focus, tool }),
    createReviewTool: () => 'review-tool',
  });
  expect(profiles.priorityPrompt(1)).toMatchObject({ tool: 'review-tool' });
  expect(profiles.analysisPrompt('security')).toMatchObject({ focus: expect.stringContaining('security') });
});
