import { resolveReviewSetup } from '../../src/review/setup.mjs';

test('resolves a trimmed token from injected environment input', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => 'OPENAI_API_TOKEN=ignored',
      readEnvFile: async () => 'OPENAI_API_TOKEN=  token  ',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
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
    }),
  ).resolves.toMatchObject({ token: 'token' });
});

test('rejects a missing token', async () => {
  await expect(
    resolveReviewSetup({
      envFile: 'ignored',
      readFile: async () => '',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    }),
  ).rejects.toThrow(/OPENAI_API_TOKEN/);
});
