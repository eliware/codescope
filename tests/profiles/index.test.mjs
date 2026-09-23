import { getProfile, PROFILE_NAMES } from '../../src/profiles/index.mjs';

test('exposes composed profile strategies for every public profile', () => {
  for (const name of PROFILE_NAMES) {
    const review = getProfile(name, 'review');
    expect(review.combine).toBeInstanceOf(Function);
    expect(review.prompt).toBeDefined();
    expect(getProfile(name, 'suggest').prompt).toBeDefined();
  }
});

test('rejects unknown profile modes at the public profile boundary', () => {
  expect(() => getProfile('missing')).toThrow(/Unknown analysis profile/);
  expect(() => getProfile('architecture', 'suggestion')).toThrow('Unknown profile mode');
});
