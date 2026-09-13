import { validateEnvironmentPermissions } from '../../src/review/environment-permissions.mjs';

test('accepts secure Unix permissions and trusted Windows ACL metadata', async () => {
  await expect(
    validateEnvironmentPermissions({
      envFile: 'config',
      inspectPermissions: async () => ({ mode: 0o600 }),
      platform: 'linux',
    }),
  ).resolves.toBeUndefined();
  const inspect = async () => ({ aclRestricted: true });
  await expect(
    validateEnvironmentPermissions({
      envFile: 'config',
      inspectPermissions: inspect,
      platform: 'win32',
    }),
  ).resolves.toBeUndefined();
});

test('rejects insecure permission metadata', async () => {
  await expect(
    validateEnvironmentPermissions({
      envFile: 'config',
      inspectPermissions: async () => ({ mode: 0o644 }),
      platform: 'linux',
    }),
  ).rejects.toThrow(/group or other/);
  await expect(
    validateEnvironmentPermissions({
      envFile: 'config',
      inspectPermissions: async () => ({}),
      platform: 'linux',
    }),
  ).rejects.toThrow(/could not be verified/);
  await expect(
    validateEnvironmentPermissions({
      envFile: 'config',
      inspectPermissions: async () => ({}),
      platform: 'win32',
    }),
  ).rejects.toThrow(/ACL restrictions/);
});

test('applies the same private-mode rule to supported POSIX platforms', async () => {
  for (const platform of ['darwin', 'freebsd']) {
    await expect(
      validateEnvironmentPermissions({
        envFile: 'config',
        inspectPermissions: async () => ({ mode: 0o600 }),
        platform,
      }),
    ).resolves.toBeUndefined();
    await expect(
      validateEnvironmentPermissions({
        envFile: 'config',
        inspectPermissions: async () => ({ mode: 0o644 }),
        platform,
      }),
    ).rejects.toThrow(/group or other/);
  }
});

test('rejects an unsupported permission platform', async () => {
  await expect(
    validateEnvironmentPermissions({
      envFile: 'config',
      inspectPermissions: async () => ({ mode: 0o600 }),
      platform: 'plan9',
    }),
  ).rejects.toThrow(/Unsupported permission platform/);
});
