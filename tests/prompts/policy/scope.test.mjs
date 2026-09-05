import { scopePolicy } from '../../../src/prompts/policy/scope.mjs';

test('requires evidence and respects precise documented scope', () => {
  expect(scopePolicy).toContain('authoritative scope evidence');
  expect(scopePolicy).toContain('cited source directly supports');
  expect(scopePolicy).toContain('attached to the cited location');
});
