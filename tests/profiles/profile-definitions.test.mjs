import { getSuggestionCategories, PROFILE_DEFINITIONS } from '../../src/profiles/profile-definitions.mjs';

test('defines one metadata record for each shared profile identity', () => {
  expect(PROFILE_DEFINITIONS.architecture.files).toEqual([true, false, false]);
  expect(PROFILE_DEFINITIONS.security.suggestions).toEqual(['security']);
  expect(PROFILE_DEFINITIONS.all.files).toEqual([true, true, true]);
  expect(getSuggestionCategories('security')).toEqual(['security']);
});
