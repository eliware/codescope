import { readStableEnvironmentFile } from '../../src/review/stable-environment-reader.mjs';

test('reads an unchanged environment file and closes it', async () => {
  let closed = false;
  await expect(readStableEnvironmentFile({
    envFile: '.env',
    initialIdentity: '1:2',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => 'OPENAI_API_TOKEN=token',
      close: async () => { closed = true; },
    }),
  })).resolves.toBe('OPENAI_API_TOKEN=token');
  expect(closed).toBe(true);
});
