import { execFile as nativeExecFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(nativeExecFile);
const securityDescriptorCommand =
  '& { $Path = [Environment]::GetEnvironmentVariable(\'CODESCOPE_ACL_TARGET\'); $security = [System.IO.File]::GetAccessControl($Path); $sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value; [pscustomobject]@{ Sddl = $security.GetSecurityDescriptorSddlForm([System.Security.AccessControl.AccessControlSections]::Access); UserSid = $sid } | ConvertTo-Json -Compress }';

function powershellEnvironment(file) {
  return {
    SystemRoot: process.env.SystemRoot,
    PATH: process.env.PATH,
    PATHEXT: process.env.PATHEXT,
    COMSPEC: process.env.COMSPEC,
    CODESCOPE_ACL_TARGET: file,
  };
}

function parseSecurityDescriptor(stdout) {
  let descriptor;
  try {
    descriptor = JSON.parse(stdout);
  } catch (cause) {
    throw new Error('invalid security descriptor JSON', { cause });
  }
  if (typeof descriptor?.Sddl !== 'string' || typeof descriptor?.UserSid !== 'string')
    throw new Error('invalid security descriptor shape');

  const daclStart = descriptor.Sddl.indexOf('D:');
  if (daclStart < 0) return { userSid: descriptor.UserSid, identities: [], malformed: true };
  const systemAclStart = descriptor.Sddl.indexOf('S:', daclStart + 2);
  const dacl = descriptor.Sddl.slice(daclStart + 2, systemAclStart < 0 ? undefined : systemAclStart);
  const aceMatches = [...dacl.matchAll(/\(([^()]*)\)/gu)];
  const controls = dacl.replace(/\([^()]*\)/gu, '').replace(/^[A-Z]*/u, '');
  const identities = [];
  let malformed = Boolean(controls.trim()) || aceMatches.length === 0;
  for (const match of aceMatches) {
    const fields = match[1].split(';');
    const identity = fields[5];
    if (fields.length !== 6 || fields[0] !== 'A' || !/^S-\d(?:-\d+)+$/u.test(identity)) {
      malformed = true;
      continue;
    }
    identities.push(identity.toUpperCase());
  }
  return { userSid: descriptor.UserSid.toUpperCase(), identities, malformed };
}

export function createWindowsAclInspector({ run = execFile } = {}) {
  return async (file) => {
    let stdout;
    try {
      ({ stdout } = await run(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', securityDescriptorCommand],
        { windowsHide: true, env: powershellEnvironment(file) },
      ));
    } catch (cause) {
      throw new Error(
        `Unable to inspect Windows ACL for ${file}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    }
    if (typeof stdout !== 'string')
      throw new Error(`Unable to inspect Windows ACL for ${file}: invalid command output`);
    let parsed;
    try {
      parsed = parseSecurityDescriptor(stdout.trim());
    } catch (cause) {
      throw new Error(`Unable to inspect Windows ACL for ${file}: ${cause.message}`, { cause });
    }
    return {
      aclRestricted: Boolean(
        !parsed.malformed &&
          parsed.identities.length > 0 &&
          parsed.identities.every((identity) => identity === parsed.userSid),
      ),
      aclIdentities: parsed.identities.map((identity) => identity.toLowerCase()),
    };
  };
}
