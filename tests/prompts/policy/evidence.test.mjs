import { evidencePolicy } from '../../../src/prompts/policy/evidence.mjs';

test('defines supplied-evidence review boundaries', () => {
  expect(evidencePolicy).toContain('Use only evidence present in this request');
  expect(evidencePolicy).toContain('Do not infer npm pack');
});
