import { p0P1Policy } from '../../../src/prompts/policy/p0-p1.mjs';
test('contains emergency and release-blocker criteria', () => {
  expect(p0P1Policy).toContain('## P0');
  expect(p0P1Policy).toContain('## P1');
});
