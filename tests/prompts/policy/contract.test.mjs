import { contractPolicy } from '../../../src/prompts/policy/contract.mjs';
test('defines supplied repository contract boundaries', () => {
  expect(contractPolicy).toContain('100×4');
  expect(contractPolicy).toContain('Istanbul ignore');
  expect(contractPolicy).toContain('missing execution evidence is not a defect');
});
