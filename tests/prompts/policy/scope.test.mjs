import { scopePolicy } from '../../../src/prompts/policy/scope.mjs';

test('requires evidence and respects precise documented scope', () => {
  expect(scopePolicy).toContain('authoritative scope evidence');
  expect(scopePolicy).toContain('reconcile the cited source');
  expect(scopePolicy).toContain('attached to the cited location');
  expect(scopePolicy).toContain('partial handling');
  expect(scopePolicy).toContain('residual defect');
});
