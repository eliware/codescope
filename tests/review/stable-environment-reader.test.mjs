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

test('reports open, metadata, replacement, and read failures', async () => {
  await expect(readStableEnvironmentFile({ envFile: '.env' }))
    .rejects.toThrow(/stable environment-file opener/);
  await expect(readStableEnvironmentFile({
    envFile: '.env', initialIdentity: '1:2',
    openEnvFile: async () => ({ stat: async () => ({ isSymbolicLink: () => true }), close: async () => {} }),
  })).rejects.toThrow(/symbolic link/);
  await expect(readStableEnvironmentFile({
    envFile: '.env', initialIdentity: '1:2',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 3, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => 'unused', close: async () => {},
    }),
  })).rejects.toThrow(/replaced/);
  await expect(readStableEnvironmentFile({
    envFile: '.env', initialIdentity: '1:2',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => { throw new Error('read failed'); }, close: async () => {},
    }),
  })).rejects.toThrow(/read failed/);
});

test('preserves close failures and combined read/close failures', async () => {
  const closeError = new Error('close failed');
  await expect(readStableEnvironmentFile({
    envFile: '.env', initialIdentity: '1:2',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => 'text', close: async () => { throw closeError; },
    }),
  })).rejects.toThrow(/close failed/);
  await expect(readStableEnvironmentFile({
    envFile: '.env', initialIdentity: '1:2',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => { throw new Error('read failed'); },
      close: async () => { throw closeError; },
    }),
  })).rejects.toMatchObject({ closeError });
});

test('stringifies non-Error read failures', async () => {
  await expect(readStableEnvironmentFile({
    envFile: '.env', initialIdentity: '1:2',
    openEnvFile: async () => { throw 'open failed'; },
  })).rejects.toThrow(/open failed/);
});
