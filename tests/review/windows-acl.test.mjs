import { createWindowsAclInspector } from '../../src/review/windows-acl.mjs';

const environment = { USERDOMAIN: 'ROG-DESKTOP', USERNAME: 'russell' };

test('accepts an ACL containing only the current user', async () => {
  let command;
  const inspect = createWindowsAclInspector({
    environment,
    run: async (...args) => {
      command = args;
      return {
      stdout:
        'C:\\Users\\russell\\.codescope\n    ROG-DESKTOP\\russell:(F)\n' +
        '1 Dateien verarbeitet; 0 Fehler\n',
      };
    },
  });
  await expect(inspect('C:\\Users\\russell\\.codescope')).resolves.toMatchObject({
    aclRestricted: true,
  });
  expect(command).toEqual([
    'icacls',
    ['C:\\Users\\russell\\.codescope', '/Q'],
    { windowsHide: true },
  ]);
});

test('rejects an ACL containing another identity', async () => {
  const inspect = createWindowsAclInspector({
    environment,
    run: async () => ({
      stdout:
        'C:\\Users\\russell\\.codescope\n    ROG-DESKTOP\\russell:(F)\n    Users:(R)\n',
    }),
  });
  await expect(inspect('C:\\Users\\russell\\.codescope')).resolves.toMatchObject({
    aclRestricted: false,
  });
});

test('reports unrestricted ACLs when the current identity is unavailable', async () => {
  const inspect = createWindowsAclInspector({
    environment: {},
    run: async () => ({ stdout: 'C:\\Users\\russell\\.codescope ROG-DESKTOP\\russell:(F)\n' }),
  });
  await expect(inspect('C:\\Users\\russell\\.codescope')).resolves.toMatchObject({
    aclRestricted: false,
  });
});

test('fails closed when an ACL line cannot be parsed', async () => {
  const inspect = createWindowsAclInspector({
    environment,
    run: async () => ({
      stdout:
        'C:\\Users\\russell\\.codescope\n    ROG-DESKTOP\\russell:(F)\n    localized permission entry\n',
    }),
  });
  await expect(inspect('C:\\Users\\russell\\.codescope')).resolves.toMatchObject({
    aclRestricted: false,
    aclIdentities: ['rog-desktop\\russell'],
  });
});

test('fails closed for an unindented unknown ACL line', async () => {
  const inspect = createWindowsAclInspector({
    environment,
    run: async () => ({
      stdout:
        'C:\\Users\\russell\\.codescope\n' +
        'ROG-DESKTOP\\russell:(F)\n' +
        'Unexpected ACL output\n',
    }),
  });
  await expect(inspect('C:\\Users\\russell\\.codescope')).resolves.toMatchObject({
    aclRestricted: false,
  });
});

test('wraps ACL command failures and invalid output', async () => {
  const inspectFailure = createWindowsAclInspector({
    environment,
    run: async () => { throw new Error('access denied'); },
  });
  await expect(inspectFailure('file')).rejects.toThrow(/Unable to inspect Windows ACL.*access denied/);
  const inspectOutput = createWindowsAclInspector({
    environment,
    run: async () => ({ stdout: undefined }),
  });
  await expect(inspectOutput('file')).rejects.toThrow(/invalid command output/);
  const inspectStringFailure = createWindowsAclInspector({
    environment,
    run: async () => { throw 'access denied'; },
  });
  await expect(inspectStringFailure('file')).rejects.toThrow(/Unable to inspect Windows ACL.*access denied/);
});
