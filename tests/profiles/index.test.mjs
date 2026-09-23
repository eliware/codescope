import { getProfile } from '../../src/profiles/index.mjs';

test('composes one public profile for each supported mode', () => {
  const review = getProfile('architecture', 'review');
  const suggestion = getProfile('architecture', 'suggest');
  expect(review.combine).toBeInstanceOf(Function);
  expect(review.prompt).toBeDefined();
  expect(suggestion.prompt).toBeDefined();
});

test('rejects unknown profile modes at the public profile boundary', () => {
  expect(() => getProfile('missing')).toThrow(/Unknown analysis profile/);
  expect(() => getProfile('architecture', 'suggestion')).toThrow('Unknown profile mode');
});
