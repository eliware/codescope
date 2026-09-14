import { getProfile, PROFILE_NAMES } from '../../src/profiles/index.mjs';

test('exposes a profile strategy for every public profile', () => {
  for (const name of PROFILE_NAMES) {
    const review = getProfile(name, 'review');
    expect(review.combine).toBeInstanceOf(Function);
    expect(review.prompt).toBeDefined();
    expect(getProfile(name, 'suggest').prompt).toBeDefined();
  }
});

test('scopes cross-platform tools to their category', () => {
  expect(
    Object.keys(
      getProfile('cross-platform', 'review').prompt.tools[0].parameters.properties.issues
        .properties,
    ),
  ).toEqual(['cross_platform']);
});

test('builds every profile strategy and validates modes', async () => {
  for (const profile of PROFILE_NAMES) {
    const { combine } = getProfile(profile);
    await expect(
      combine('/root', {
        readDirectory: async () => [],
        readFileContents: async () => '{}',
        inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      }),
    ).resolves.toContain('===== package.json =====');
  }
  expect(() => getProfile('missing')).toThrow(/Unknown analysis profile/);
  expect(() => getProfile('architecture', 'suggestion')).toThrow('Unknown profile mode');
});

test('applies review source selection to suggestion profiles', async () => {
  await expect(
    getProfile('architecture', 'suggest').combine('/root', {
      readDirectory: async () => [],
      readFileContents: async () => '{}',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).resolves.toContain('package.json');
});

test('builds suggestion prompts for focused profiles', () => {
  expect(getProfile('architecture', 'suggest').prompt.tools[0].name).toBe('submit_suggestions');
  expect(getProfile('security', 'suggest').prompt.tools[0].name).toBe('submit_suggestions');
});
