import { prepareReview } from '../../src/review/prepare-review.mjs';

const setup = {
  envFile: 'ignored',
  readFile: async () => 'OPENAI_API_TOKEN=ignored',
  readEnvFile: async () => 'OPENAI_API_TOKEN= token ',
  inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  openEnvFile: async () => ({
    stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
    readFile: async () => 'OPENAI_API_TOKEN= token ',
    close: async () => {},
  }),
};

test('prepares the provider client from the resolved token', async () => {
  const client = {};
  await expect(
    prepareReview({ ...setup, createClient: (options) => ({ options, client }) }),
  ).resolves.toMatchObject({ token: 'token', client: { options: { apiKey: 'token' } } });
});

test('does not initialize the provider when setup fails', async () => {
  const createClient = () => {
    throw new Error('must not initialize');
  };
  await expect(
    prepareReview({
      ...setup,
      openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
        readFile: async () => '',
        close: async () => {},
      }),
      createClient,
    }),
  ).rejects.toThrow(/OPENAI_API_TOKEN/);
});
