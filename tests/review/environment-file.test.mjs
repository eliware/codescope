import { readReviewEnvironmentFile } from '../../src/review/environment-file.mjs';

test('reads a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      readFile: () => {},
      readEnvFile: async () => 'x',
      inspectFile: async () => ({}),
    }),
  ).resolves.toBe('x');
});
