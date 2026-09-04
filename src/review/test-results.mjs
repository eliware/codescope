import { exec } from 'node:child_process';
import { promisify } from 'node:util';
export { redactTestOutput } from './redaction.mjs';
import { redactTestOutput } from './redaction.mjs';

const runCommand = promisify(exec);

export async function collectTestResults(cwd, timeout, execute = runCommand, redact = redactTestOutput) {
  if (!Number.isFinite(timeout) || timeout < 1) throw new Error('Test timeout must be positive');
  try {
    const result = await execute('npm test', { cwd, timeout, maxBuffer: 1_000_000, windowsHide: true });
    const output = redact(`${String(result.stdout ?? '')}${String(result.stderr ?? '')}`);
    const code = result.code ?? 0;
    return `===== npm test =====\n${code === 0 ? 'exit code: 0' : `exit code: ${code}`}\n${output}`;
  } catch (cause) {
    const output = redact(`${String(cause.stdout ?? '')}${String(cause.stderr ?? '')}`);
    const status = cause.killed ? `timed out after ${timeout / 1000} seconds` : `exit code: ${cause.code ?? 'unknown'}`;
    return `===== npm test =====\n${status}\n${output}`;
  }
}

export function testEvidenceBlocks(testResults) {
  if (typeof testResults !== 'string') return false;
  const match = testResults.match(/(?:^|\r?\n)===== npm test =====\r?\n([^\r\n]*)/u);
  if (!match) return false;
  const status = match[1].trim();
  return /^(?:exit code:\s*(?:[1-9]\d*|unknown)|timed out after\b)/iu.test(status);
}
