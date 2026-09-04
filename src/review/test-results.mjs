import { execFile } from 'node:child_process';
import process from 'node:process';
import { promisify } from 'node:util';
import path from 'node:path';
import { existsSync } from 'node:fs';
export { redactTestOutput } from './redaction.mjs';
import { redactTestOutput } from './redaction.mjs';
export { testEvidenceBlocks } from './test-status.mjs';

const runCommand = promisify(execFile);
export const resolveNpmCommand = (
  platform = process.platform,
  npmExecPath = process.env.npm_execpath,
  bundledNpm = path.join(
    path.dirname(process.execPath),
    'node_modules',
    'npm',
    'bin',
    'npm-cli.js',
  ),
) => {
  const candidates = [];
  if (npmExecPath) candidates.push([process.execPath, [npmExecPath, 'test'], false]);
  if (existsSync(bundledNpm)) candidates.push([process.execPath, [bundledNpm, 'test'], false]);
  candidates.push([platform === 'win32' ? 'npm.cmd' : 'npm', ['test'], false]);
  return candidates;
};

export async function collectTestResults(
  cwd,
  timeout,
  execute = runCommand,
  redact = redactTestOutput,
  platform = process.platform,
  environment = process.env,
) {
  if (!Number.isFinite(timeout) || timeout < 1) throw new Error('Test timeout must be positive');
  try {
    let result;
    let lastCause;
    for (const [executable, args, shell] of resolveNpmCommand(platform, environment.npm_execpath)) {
      try {
        const env = { ...environment, npm_node_execpath: process.execPath };
        if (typeof args[0] === 'string' && args[0].endsWith('npm-cli.js'))
          env.npm_execpath = args[0];
        result = await execute(executable, args, {
          cwd,
          timeout,
          maxBuffer: 1_000_000,
          windowsHide: true,
          shell,
          env,
        });
        break;
      } catch (cause) {
        lastCause = cause;
        if (!['ENOENT', 'EACCES', 'EPERM', 'ENOTDIR'].includes(cause?.code)) throw cause;
      }
    }
    if (!result) throw lastCause;
    const output = redact(`${String(result.stdout ?? '')}${String(result.stderr ?? '')}`);
    const code = result.code ?? 0;
    return `===== npm test =====\n${code === 0 ? 'exit code: 0' : `exit code: ${code}`}\n${output}`;
  } catch (cause) {
    const output = redact(`${String(cause.stdout ?? '')}${String(cause.stderr ?? '')}`);
    const status = cause.killed
      ? `timed out after ${timeout / 1000} seconds`
      : cause.code === 'ENOENT'
        ? 'runner error: npm test command was not found'
        : `exit code: ${cause.code ?? 'unknown'}`;
    return `===== npm test =====\n${status}\n${output}`;
  }
}
