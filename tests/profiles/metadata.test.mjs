import { PROFILE_NAMES, getProfileFiles } from '../../src/profiles/metadata.mjs';

test('defines all public profile source selections', () => {
  expect(PROFILE_NAMES).toContain('all');
  expect(getProfileFiles('all')).toEqual([true, true, true]);
  expect(getProfileFiles('release')).toEqual([true, true, true]);
  expect(() => getProfileFiles('missing')).toThrow('Unknown analysis profile');
});
