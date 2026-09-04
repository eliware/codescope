import { defaultEnvFile, loadEnv } from '../src/review-config.mjs';
test('public config barrel exports configuration functions', () => {
  expect(typeof defaultEnvFile).toBe('function');
  expect(typeof loadEnv).toBe('function');
});
