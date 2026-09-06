import { transportPolicy } from '../../../src/prompts/policy/transport.mjs';

test('limits the transport exception to provider output', () => {
  expect(transportPolicy).toMatch(/provider-output\s+guidance/u);
  expect(transportPolicy).toContain("Continue reviewing CodeScope's own");
  expect(transportPolicy).toMatch(/executed failing supplied npm\s+test remains P0/u);
  expect(transportPolicy).toContain(
    'Suggestion and custom-prompt profiles do not require or validate a verdict',
  );
  expect(transportPolicy).toContain('normal review and unified-review status');
});
