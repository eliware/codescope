import { ceoPriorityGuidance, globalReviewInstructions } from '../../../src/prompts/policy/review-guidance.mjs';

test('assembles the review guidance policies in order', () => {
  expect(globalReviewInstructions.startsWith(ceoPriorityGuidance)).toBe(true);
  expect(globalReviewInstructions.length).toBeGreaterThan(ceoPriorityGuidance.length);
});
