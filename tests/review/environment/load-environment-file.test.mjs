import { loadEnvironmentFile } from '../../../src/review/environment/load-environment-file.mjs';

test('loads and parses an environment file', async () => {
  await expect(loadEnvironmentFile({
    envFile: '.env',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => 'OPENAI_API_TOKEN=file',
      close: async () => {},
    }),
    inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  })).resolves.toEqual({ OPENAI_API_TOKEN: 'file' });
});
