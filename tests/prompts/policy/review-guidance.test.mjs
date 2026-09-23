import { ceoPriorityGuidance, globalReviewInstructions } from '../../../src/prompts/policy/review-guidance.mjs';

test('assembles the review guidance policies', () => {
  expect(ceoPriorityGuidance).toContain('## P0');
  expect(ceoPriorityGuidance).toContain('## P1');
  expect(globalReviewInstructions).toContain('No issues found.');
  expect(globalReviewInstructions).toContain('never report "missing CI workflow evidence"');
});
