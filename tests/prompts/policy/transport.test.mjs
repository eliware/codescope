import { transportPolicy } from '../../../src/prompts/policy/transport.mjs';

test('defines raw provider passthrough', () => {
  expect(transportPolicy).toContain('exact provider response unchanged');
  expect(transportPolicy).toContain('does not parse, validate, redact');
  expect(transportPolicy).toContain('provider requests exit successfully');
});
