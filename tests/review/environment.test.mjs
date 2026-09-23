import { loadReviewEnvironment } from '../../src/review/environment.mjs';

const base = {
  envFile: 'custom.env',
  readFile: async () => 'OPENAI_API_TOKEN=token',
  inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  openEnvFile: async () => ({
    stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
    readFile: async () => 'OPENAI_API_TOKEN=token',
    close: async () => {},
  }),
};

test('loads the configured environment through the composition boundary', async () => {
  await expect(loadReviewEnvironment(base)).resolves.toMatchObject({ OPENAI_API_TOKEN: 'token' });
});

