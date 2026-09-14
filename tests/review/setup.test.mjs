import { resolveReviewSetup } from '../../src/review/setup.mjs';

const openEnvFile = async () => ({
  stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
  readFile: async () => 'OPENAI_API_TOKEN=token',
  close: async () => {},
});

test('resolves a trimmed token from the configured environment file', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => 'OPENAI_API_TOKEN=ignored',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile,
    }),
  ).resolves.toMatchObject({ token: 'token' });
});

test('uses the configured opener for environment text', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile,
    }),
  ).resolves.toMatchObject({ token: 'token' });
});

test('rejects a missing token', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => '',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
        readFile: async () => '',
        close: async () => {},
      }),
    }),
  ).rejects.toThrow(/OPENAI_API_TOKEN/);
});
