import { createConventionPrompt } from '../../src/prompts/conventions.mjs';

test('requests convention review over supplied artifacts without structural enforcement', () => {
  const result = createConventionPrompt((focus) => ({ focus }));
  expect(result.focus).toContain('README');
  expect(result.focus).toContain('package metadata');
  expect(result.focus).toContain('missing or unsupplied artifacts');
  expect(result.focus).toContain('Deterministic tooling');
});
