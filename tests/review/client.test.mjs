import { initializeReviewClient } from '../../src/review/client.mjs';

test('initializes the provider client with the token', () => {
  const client = {};
  expect(initializeReviewClient((options) => { expect(options).toEqual({ apiKey: 'token' }); return client; }, 'token')).toBe(client);
});

test('wraps provider client initialization failures', () => {
  expect(() => initializeReviewClient(() => { throw new Error('bad config'); }, 'token')).toThrow('Unable to initialize OpenAI client');
});
