import { p2P3Policy } from '../../../src/prompts/policy/p2-p3.mjs';
test('contains follow-up and polish criteria', () => {
  expect(p2P3Policy).toContain('## P2');
  expect(p2P3Policy).toContain('## P3');
});
