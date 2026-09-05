import { createConventionPrompt } from '../../src/prompts/conventions.mjs';

test('requests convention review over supplied artifacts without structural enforcement', () => {
  const result = createConventionPrompt((focus) => ({ focus }));
  expect(result.focus).toContain('README.md');
  expect(result.focus).toContain('package metadata');
  expect(result.focus).toContain('Do not turn missing');
  expect(result.focus).toContain('deterministic tooling');
});
