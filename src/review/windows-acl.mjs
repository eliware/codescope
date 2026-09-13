import { execFile as nativeExecFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(nativeExecFile);

function currentIdentity(environment = process.env) {
  const domain = environment.USERDOMAIN;
  const user = environment.USERNAME;
  return domain && user ? `${domain}\\${user}`.toLowerCase() : undefined;
}

function isAclSummary(line) {
  return !line.includes(':') && (line.match(/\d+/gu) || []).length >= 2;
}

export function createWindowsAclInspector({ run = execFile, environment = process.env } = {}) {
  return async (file) => {
    const { stdout } = await run('icacls', [file, '/Q'], { windowsHide: true });
    const owner = currentIdentity(environment);
    const identities = [];
    let hasUnrecognizedAclLine = false;
    for (const [index, line] of stdout.split(/\r?\n/u).entries()) {
      if (!line.trim()) continue;
      const matches = [...line.matchAll(/(?:^|\s)([^:\r\n]+):\s*((?:\([^)]*\)\s*)+)/gu)];
      if (matches.length > 0) {
        identities.push(...matches.map((match) => match[1].trim().toLowerCase()));
      } else if (index !== 0 && !isAclSummary(line.trim())) {
        hasUnrecognizedAclLine = true;
      }
    }
    return {
      aclRestricted: Boolean(
        owner && identities.length > 0 && !hasUnrecognizedAclLine && identities.every((value) => value === owner),
      ),
      aclIdentities: identities,
    };
  };
}
