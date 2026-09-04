import { loadReviewEnvironment } from '../../src/review/environment.mjs';

const base = {
  envFile: 'custom.env',
  readFile: async () => 'OPENAI_API_TOKEN=token',
  readEnvFile: async () => 'OPENAI_API_TOKEN=token',
  inspectFile: async () => ({ isSymbolicLink: () => false }),
  inspectPermissions: async () => ({ mode: 0o600 }),
  platform: 'win32',
};

test('loads environment values from the configured file', async () => {
  await expect(loadReviewEnvironment(base)).resolves.toMatchObject({ OPENAI_API_TOKEN: 'token' });
});

test('preserves missing environment files', async () => {
  await expect(loadReviewEnvironment({ ...base, readEnvFile: async () => { throw { code: 'ENOENT' }; } })).resolves.toBeDefined();
});

test('rejects a symbolic default environment file', async () => {
  const envFile = `${process.env.USERPROFILE}\\.codescope`;
  await expect(loadReviewEnvironment({ ...base, envFile, readEnvFile: base.readFile, inspectFile: async () => ({ isSymbolicLink: () => true }) })).rejects.toThrow('symbolic link');
});
