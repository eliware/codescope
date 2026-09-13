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
      defaultInspector: async () => ({}),
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
      defaultInspector: async () => ({}),
      platform: 'win32',
    }),
  ).rejects.toThrow(/ACL restrictions/);
});
