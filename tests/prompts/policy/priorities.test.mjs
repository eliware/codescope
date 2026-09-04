import { priorityPolicy } from '../../../src/prompts/policy/priorities.mjs';
test('defines all four priorities', () => {
  expect(priorityPolicy).toContain('P0');
  expect(priorityPolicy).toContain('P1');
  expect(priorityPolicy).toContain('P2');
  expect(priorityPolicy).toContain('P3');
});
