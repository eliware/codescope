import { parseCommandOptions } from '../../../src/cli/options/command-options.mjs';

test('accepts only options from the supplied command allowlist', () => {
  expect(parseCommandOptions(['--usage'], 'usage', new Set(['--usage']))).toMatchObject({ usage: true });
  expect(() => parseCommandOptions(['--unknown'], 'usage', new Set(['--usage']))).toThrow('usage');
});
