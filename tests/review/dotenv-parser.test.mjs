import { loadEnv } from '../../src/review/dotenv-parser.mjs';

test('loads the supported token from dotenv text', () => {
  const environment = {};
  loadEnv('export OPENAI_API_TOKEN="secret"', environment);
  expect(environment.OPENAI_API_TOKEN).toBe('secret');
});
