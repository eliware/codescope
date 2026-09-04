import { resolveReviewSetup } from '../../src/review/setup.mjs';

test('resolves a trimmed token from injected environment input', async () => {
  await expect(resolveReviewSetup({
    envFile: 'ignored',
    readFile: async () => 'OPENAI_API_TOKEN=ignored',
    readEnvFile: async () => 'OPENAI_API_TOKEN=  token  ',
    inspectFile: async () => ({}),
    inspectPermissions: async () => ({}),
    platform: 'win32',
  })).resolves.toMatchObject({ token: 'token' });
});
