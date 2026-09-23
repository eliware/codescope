import { collectAndPrepare } from '../../../src/review/pipeline/collect-and-prepare.mjs';

test('collects context and prepares the provider in order', async () => {
  const calls = [];
  await expect(collectAndPrepare('repo', {
    combine: async () => { calls.push('combine'); return 'context'; },
    createClient: () => { calls.push('client'); return 'client'; },
    readFile: async () => '',
    envFile: 'repo/.env',
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => 'OPENAI_API_TOKEN=token',
      close: async () => {},
    }),
    inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    environment: {},
  })).resolves.toMatchObject({ combined: 'context', client: 'client' });
  expect(calls).toEqual(['combine', 'client']);
});
