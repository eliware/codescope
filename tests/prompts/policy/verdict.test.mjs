import { verdictPolicy } from '../../../src/prompts/policy/verdict.mjs';
test('defines evidence and verdict rules', () => {
  expect(verdictPolicy).toContain('Return `block`');
  expect(verdictPolicy).toContain('Evidence requirements');
});
