import { createProfileCombiner } from '../../src/profiles/source-selection.mjs';

test('creates review and suggestion source selectors', async () => {
  const options = {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  };
  await expect(
    createProfileCombiner([true, false, false], 'review')('/repo', options),
  ).resolves.toContain('package.json');
  await expect(
    createProfileCombiner([true, false, true], 'suggest')('/repo', options),
  ).resolves.toContain('package.json');
});
