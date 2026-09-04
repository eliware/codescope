import { ceoPriorityGuidance, globalReviewInstructions } from '../../src/prompts/policy.mjs';

test('exports the shared priority and evidence policy', () => {
  expect(ceoPriorityGuidance).toContain('## P0');
  expect(ceoPriorityGuidance).toContain('## P1');
  expect(globalReviewInstructions).toContain('codescope ignore:');
  expect(globalReviewInstructions).toContain('No issues found.');
});
