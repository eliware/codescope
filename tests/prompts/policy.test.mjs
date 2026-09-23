import { ceoPriorityGuidance, globalReviewInstructions } from '../../src/prompts/policy.mjs';

test('assembles the shared review policy', () => {
  expect(ceoPriorityGuidance).toContain('## P0');
  expect(ceoPriorityGuidance).toContain('## P1');
  expect(globalReviewInstructions).toContain('No issues found.');
  expect(globalReviewInstructions).toContain('never report "missing CI workflow evidence"');
  expect(globalReviewInstructions).toContain('Do not require stored CI execution results');
});
