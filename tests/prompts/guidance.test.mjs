import { defaultDeveloperText } from '../../src/prompts/guidance.mjs';

test('provides the shared developer guidance', () => {
  expect(defaultDeveloperText).toContain('ignore_example');
  expect(defaultDeveloperText).toContain('copy-paste-ready');
  expect(defaultDeveloperText).toContain('inspect the cited implementation together');
  expect(defaultDeveloperText).toContain('Do not recommend changes that already exist');
});
