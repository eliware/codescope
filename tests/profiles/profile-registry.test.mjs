import { profileRegistry } from '../../src/profiles/profile-registry.mjs';

test('contains the supported review profile names', () => {
  expect(profileRegistry).toHaveProperty('all');
  expect(profileRegistry).toHaveProperty('security');
  expect(profileRegistry).toHaveProperty('p0');
});
