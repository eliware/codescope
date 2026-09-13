import { loadReviewEnvironment } from '../../src/review/environment.mjs';
import { validateEnvironmentPermissions } from '../../src/review/environment-permissions.mjs';
import { defaultEnvFile } from '../../src/review/config.mjs';

const base = {
  envFile: 'custom.env',
  readFile: async () => 'OPENAI_API_TOKEN=token',
  readEnvFile: async () => 'OPENAI_API_TOKEN=token',
  inspectFile: async () => ({ isSymbolicLink: () => false }),
  inspectPermissions: async () => ({ aclRestricted: true }),
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
      inspectFile: async () => {
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
  ).rejects.toThrow(/disappeared/);
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
      inspectPermissions: async () => ({ mode: 0o600 }),
    }),
  ).resolves.toBeDefined();
  await expect(
    loadReviewEnvironment({ ...defaults, inspectPermissions: async () => ({ mode: 0 }) }),
  ).resolves.toBeDefined();
});

test('rejects a Unix environment file that disappears before permission inspection', async () => {
  await expect(
    loadReviewEnvironment({
      envFile: defaultEnvFile(),
      readFile: async () => 'OPENAI_API_TOKEN=token',
      readEnvFile: async () => 'OPENAI_API_TOKEN=token',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      inspectPermissions: async () => {
        throw Object.assign(new Error('gone'), { code: 'ENOENT' });
      },
      platform: 'linux',
      validatePermissions: true,
    }),
  ).rejects.toThrow(/disappeared/);
});

test('allows a Unix file that is already absent during permission inspection', async () => {
  await expect(
    validateEnvironmentPermissions({
      envFile: defaultEnvFile(),
      inspectPermissions: async () => {
        throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      },
      platform: 'linux',
      filePresent: false,
    }),
  ).resolves.toBeUndefined();
});

test('checks custom files for symbolic links without requiring default permissions', async () => {
  const readFile = async () => 'OPENAI_API_TOKEN=token';
  let inspected = false;
  const environment = await loadReviewEnvironment({
    envFile: 'custom.env',
    readFile,
    readEnvFile: async () => 'OPENAI_API_TOKEN=custom',
    inspectFile: async () => {
      inspected = true;
      return { isSymbolicLink: () => false };
    },
    inspectPermissions: async () => {
      throw new Error('not called');
    },
    platform: 'win32',
    validatePermissions: false,
    environment: {},
  });
  expect(environment.OPENAI_API_TOKEN).toBe('custom');
  expect(inspected).toBe(true);
});

test('rejects a symbolic custom environment file', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow(/symbolic link/);
});

test('checks permissions for a custom file when using the native reader', async () => {
  const readFile = async () => 'OPENAI_API_TOKEN=token';
  await expect(
    loadReviewEnvironment({
      envFile: 'custom.env',
      readFile,
      readEnvFile: readFile,
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      inspectPermissions: async () => ({ aclRestricted: false }),
      platform: 'win32',
      environment: {},
    }),
  ).rejects.toThrow(/ACL restrictions/);
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
  ).rejects.toThrow(/ACL restrictions/);
});

test('rejects Windows default environment files without trusted ACL metadata', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      readEnvFile: base.readFile,
      inspectPermissions: async () => ({}),
      platform: 'win32',
    }),
  ).rejects.toThrow(/ACL restrictions/);
});

test('allows a missing Windows default environment file', async () => {
  const missingReader = async () => {
    throw Object.assign(new Error('missing'), { code: 'ENOENT' });
  };
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      readFile: missingReader,
      readEnvFile: missingReader,
      inspectFile: async () => {
        throw Object.assign(new Error('missing'), { code: 'ENOENT' });
      },
      inspectPermissions: async () => {
        throw { code: 'ENOENT' };
      },
      platform: 'win32',
    }),
  ).resolves.toBeDefined();
});

test('rejects a Windows environment file that disappears before permission inspection', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      readEnvFile: base.readFile,
      inspectPermissions: async () => {
        throw Object.assign(new Error('gone'), { code: 'ENOENT' });
      },
      platform: 'win32',
    }),
  ).rejects.toThrow(/disappeared/);
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
