import { execFile } from 'node:child_process';
import process from 'node:process';
import { promisify } from 'node:util';
import { resolveNpmCommand } from './npm-command.mjs';
import { normalizeExecutionResult, resolveResultCode } from './execution-result.mjs';
export { redactTestOutput } from './redaction.mjs';
import { redactTestOutput } from './redaction.mjs';
export { testEvidenceBlocks } from './test-status.mjs';

const runCommand = promisify(execFile);
export const defaultTestExecutor = runCommand;
export { normalizeExecutionResult, resolveResultCode } from './execution-result.mjs';
export { resolveNpmCommand } from './npm-command.mjs';

export async function collectTestResults(
  cwd,
  timeout,
  execute = defaultTestExecutor,
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
        if (cause?.code !== 'ENOENT') throw cause;
      }
    }
    if (!result) throw lastCause;
    const output = redact(`${String(result.stdout ?? '')}${String(result.stderr ?? '')}`);
    const normalizedResult = normalizeExecutionResult(result, execute === defaultTestExecutor);
    const code = resolveResultCode(normalizedResult);
    return `===== npm test =====\nstatus: ${code === 0 ? 'pass' : 'fail'}\n${code === 0 ? 'exit code: 0' : `exit code: ${code}`}\n${output}`;
  } catch (cause) {
    const output = redact(`${String(cause.stdout ?? '')}${String(cause.stderr ?? '')}`);
    const status = cause.killed
      ? `timed out after ${timeout / 1000} seconds`
      : cause.code === 'ENOENT'
        ? 'runner error: npm test command was not found'
        : `runner failure: npm test could not complete (${cause.code ?? 'unknown'})`;
    return `===== npm test =====\nstatus: fail\n${status}\n${output}`;
  }
}
