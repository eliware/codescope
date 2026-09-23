import {
  getSuggestionCategories, PROFILE_DEFINITIONS, PROFILE_NAMES, getProfileFiles,
} from '../../src/profiles/profile-definitions.mjs';

test('defines one metadata record for each shared profile identity', () => {
  expect(PROFILE_DEFINITIONS.architecture.files).toEqual([true, false, false]);
  expect(PROFILE_DEFINITIONS.security.suggestions).toEqual(['security']);
  expect(PROFILE_DEFINITIONS.all.files).toEqual([true, true, true]);
  expect(getSuggestionCategories('security')).toEqual(['security']);
});

test('derives public profile names and source selections from the definitions', () => {
  expect(PROFILE_NAMES).toContain('all');
  expect(getProfileFiles('all')).toEqual([true, true, true]);
  expect(getProfileFiles('release')).toEqual([true, true, true]);
  expect(() => getProfileFiles('missing')).toThrow('Unknown analysis profile');
});
