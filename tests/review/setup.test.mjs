import { resolveReviewSetup } from '../../src/review/setup.mjs';

const openEnvFile = async () => ({
  stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
  readFile: async () => 'OPENAI_API_TOKEN=token',
  close: async () => {},
});

test('resolves a trimmed token from injected environment input', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => 'OPENAI_API_TOKEN=ignored',
      readEnvFile: async () => 'OPENAI_API_TOKEN=  token  ',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile,
    }),
  ).resolves.toMatchObject({ token: 'token' });
});

test('uses readFile when no separate environment reader is supplied', async () => {
  const readFile = async () => 'OPENAI_API_TOKEN=token';
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile,
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
