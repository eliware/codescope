import { identityPolicy } from '../../../src/prompts/policy/identity.mjs';
test('defines CodeScope identity and known-issue policy', () => {
  expect(identityPolicy).toContain('You are CodeScope');
  expect(identityPolicy).toContain('known issues');
});
