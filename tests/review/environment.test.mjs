import { loadReviewEnvironment } from '../../src/review/environment.mjs';
import { defaultEnvFile } from '../../src/review/config.mjs';

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
  await expect(
    loadReviewEnvironment({
      ...base,
      readEnvFile: async () => {
        throw { code: 'ENOENT' };
      },
    }),
  ).resolves.toBeDefined();
});

test('rejects a symbolic default environment file', async () => {
  const envFile = defaultEnvFile();
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile,
      readEnvFile: base.readFile,
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow('symbolic link');
});

test('handles permission and inspection failures with context', async () => {
  const reader = async () => 'OPENAI_API_TOKEN=token';
  const defaults = {
    envFile: defaultEnvFile(),
    readFile: reader,
    readEnvFile: reader,
    inspectFile: async () => ({ isSymbolicLink: () => false }),
    inspectPermissions: async () => ({ mode: 0o644 }),
    platform: 'linux',
    environment: {},
  };
  await expect(loadReviewEnvironment(defaults)).rejects.toThrow(/readable/);
  await expect(
    loadReviewEnvironment({
      ...defaults,
      inspectPermissions: async () => {
        throw new Error('stat');
      },
    }),
  ).rejects.toThrow(/Unable to inspect/);
  await expect(
    loadReviewEnvironment({
      ...defaults,
      readEnvFile: async () => {
        throw Object.assign(new Error('read'), { code: 'EIO' });
      },
    }),
  ).rejects.toThrow(/Unable to read/);
  await expect(
    loadReviewEnvironment({
      ...defaults,
      inspectFile: async () => {
        throw 'stat';
      },
    }),
  ).rejects.toThrow(/Unable to inspect/);
  await expect(
    loadReviewEnvironment({
      ...defaults,
      readEnvFile: async () => {
        throw 'read';
      },
    }),
  ).rejects.toThrow(/Unable to read/);
  await expect(
    loadReviewEnvironment({
      ...defaults,
      inspectPermissions: async () => {
        throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      },
    }),
  ).resolves.toBeDefined();
  await expect(
    loadReviewEnvironment({
      ...defaults,
      inspectPermissions: async () => {
        throw 'permissions';
      },
    }),
  ).rejects.toThrow(/Unable to inspect/);
  await expect(
    loadReviewEnvironment({
      ...defaults,
      inspectFile: async () => {
        throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      },
      inspectPermissions: async () => ({ mode: 0 }),
    }),
  ).resolves.toBeDefined();
  await expect(
    loadReviewEnvironment({ ...defaults, inspectPermissions: async () => ({ mode: 0 }) }),
  ).resolves.toBeDefined();
});

test('skips default-file protections for custom files and Windows', async () => {
  const readFile = async () => 'OPENAI_API_TOKEN=token';
  const environment = await loadReviewEnvironment({
    envFile: 'custom.env',
    readFile,
    readEnvFile: async () => 'OPENAI_API_TOKEN=custom',
    inspectFile: async () => {
      throw new Error('not called');
    },
    inspectPermissions: async () => {
      throw new Error('not called');
    },
    platform: 'win32',
    environment: {},
  });
  expect(environment.OPENAI_API_TOKEN).toBe('custom');
});

test('rejects an explicitly unrestricted Windows default environment file', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      readEnvFile: base.readFile,
      inspectPermissions: async () => ({ aclRestricted: false }),
      platform: 'win32',
    }),
  ).rejects.toThrow(/other users/);
});

test('allows a missing Windows default environment file', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      readEnvFile: base.readFile,
      inspectPermissions: async () => {
        throw { code: 'ENOENT' };
      },
      platform: 'win32',
    }),
  ).resolves.toBeDefined();
});

test('wraps Windows permission inspection failures', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      readEnvFile: base.readFile,
      inspectPermissions: async () => {
        throw new Error('acl');
      },
      platform: 'win32',
    }),
  ).rejects.toThrow(/Unable to inspect/);
});

test('preserves non-Error Windows permission failures in context', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      readEnvFile: base.readFile,
      inspectPermissions: async () => {
        throw 'acl failure';
      },
      platform: 'win32',
    }),
  ).rejects.toThrow(/acl failure/);
});
