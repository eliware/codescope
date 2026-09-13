import { createWindowsAclInspector } from '../../src/review/windows-acl.mjs';

const userSid = 'S-1-5-21-100-200-300-1003';
const otherSid = 'S-1-5-32-545';
const descriptor = (aces) =>
  JSON.stringify({
    Sddl: `O:${userSid}G:${userSid}D:PAI${aces.map((sid) => `(A;;FA;;;${sid})`).join('')}S:`,
    UserSid: userSid,
  });

test('accepts an SDDL ACL containing only the current user SID', async () => {
  let command;
  const inspect = createWindowsAclInspector({
    run: async (...args) => {
      command = args;
      return { stdout: descriptor([userSid]) };
    },
  });
  await expect(inspect('C:\\Users\\russell\\.codescope')).resolves.toMatchObject({
    aclRestricted: true,
    aclIdentities: [userSid.toLowerCase()],
  });
  expect(command).toMatchObject({
    0: 'powershell.exe',
    1: [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      expect.stringContaining('GetSecurityDescriptorSddlForm'),
      'C:\\Users\\russell\\.codescope',
    ],
    2: { windowsHide: true },
  });
});

test('rejects an SDDL ACL containing another SID', async () => {
  const inspect = createWindowsAclInspector({ run: async () => ({ stdout: descriptor([userSid, otherSid]) }) });
  await expect(inspect('file')).resolves.toMatchObject({
    aclRestricted: false,
    aclIdentities: [userSid.toLowerCase(), otherSid.toLowerCase()],
  });
});

test('fails closed when the current SID or DACL is unavailable', async () => {
  const missingUser = createWindowsAclInspector({
    run: async () => ({ stdout: JSON.stringify({ Sddl: `D:PAI(A;;FA;;;${userSid})` }) }),
  });
  await expect(missingUser('file')).rejects.toThrow(/invalid security descriptor shape/);
  const missingDacl = createWindowsAclInspector({
    run: async () => ({ stdout: JSON.stringify({ Sddl: `O:${userSid}`, UserSid: userSid }) }),
  });
  await expect(missingDacl('file')).resolves.toMatchObject({ aclRestricted: false });
});

test('fails closed for malformed SDDL ACEs', async () => {
  const inspect = createWindowsAclInspector({
    run: async () => ({
      stdout: JSON.stringify({
        Sddl: `O:${userSid}G:${userSid}D:PAI(A;;FA;;;not-a-sid)`,
        UserSid: userSid,
      }),
    }),
  });
  await expect(inspect('file')).resolves.toMatchObject({ aclRestricted: false, aclIdentities: [] });
});

test('wraps command and machine-readable output failures', async () => {
  const inspectFailure = createWindowsAclInspector({
    run: async () => {
      throw new Error('access denied');
    },
  });
  await expect(inspectFailure('file')).rejects.toThrow(/Unable to inspect Windows ACL.*access denied/);
  const inspectOutput = createWindowsAclInspector({ run: async () => ({ stdout: undefined }) });
  await expect(inspectOutput('file')).rejects.toThrow(/invalid command output/);
  const inspectJson = createWindowsAclInspector({ run: async () => ({ stdout: 'not json' }) });
  await expect(inspectJson('file')).rejects.toThrow(/invalid security descriptor JSON/);
  const inspectStringFailure = createWindowsAclInspector({ run: async () => { throw 'access denied'; } });
  await expect(inspectStringFailure('file')).rejects.toThrow(/Unable to inspect Windows ACL.*access denied/);
});
