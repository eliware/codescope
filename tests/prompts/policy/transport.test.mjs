import { transportPolicy } from '../../../src/prompts/policy/transport.mjs';

test('limits the transport exception to provider output', () => {
  expect(transportPolicy).toContain('provider-output\nguidance');
  expect(transportPolicy).toContain("Continue reviewing CodeScope's own");
  expect(transportPolicy).toMatch(/executed failing\s+supplied npm test remains P0/u);
});
