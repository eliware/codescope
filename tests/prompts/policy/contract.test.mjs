import { contractPolicy } from '../../../src/prompts/policy/contract.mjs';
test('defines supplied repository contract boundaries', () => {
  expect(contractPolicy).toContain('Convention v8');
  expect(contractPolicy).toContain('applicability includes');
  expect(contractPolicy).toContain('one-shot');
  expect(contractPolicy).toContain('missing or unsupplied evidence as unknown');
  expect(contractPolicy).toContain('canonical requirements remain owned by Conventions');
  expect(contractPolicy).toContain('reviewContract');
});
