import { createReviewTool, reviewTool } from '../../src/prompts/review-tool.mjs';

test('creates strict review tools with required categories', () => {
  expect(reviewTool.name).toBe('submit_review');
  expect(createReviewTool(['security']).parameters.properties.issues.required).toEqual([
    'security',
  ]);
});
