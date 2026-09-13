import { resolveReviewSetup } from '../../src/review/setup.mjs';

test('resolves a trimmed token from injected environment input', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => 'OPENAI_API_TOKEN=ignored',
      readEnvFile: async () => 'OPENAI_API_TOKEN=  token  ',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      inspectPermissions: async () => ({}),
      platform: 'win32',
      validatePermissions: false,
    }),
  ).resolves.toMatchObject({ token: 'token' });
});

test('uses readFile when no separate environment reader is supplied', async () => {
  const readFile = async () => 'OPENAI_API_TOKEN=token';
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile,
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      inspectPermissions: async () => ({ aclRestricted: true }),
      platform: 'win32',
    }),
  ).resolves.toMatchObject({ token: 'token' });
});

test('rejects a missing token', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => '',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      inspectPermissions: async () => ({ aclRestricted: true }),
      platform: 'win32',
    }),
  ).rejects.toThrow(/OPENAI_API_TOKEN/);
});
