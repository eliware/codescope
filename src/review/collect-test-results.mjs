import { execFile } from 'node:child_process';
import process from 'node:process';
import { promisify } from 'node:util';
import { normalizeExecutionResult, resolveResultCode } from './execution-result.mjs';
import { redactTestOutput } from './redaction.mjs';
import { executeNpmTest } from './test-execution.mjs';
import { formatTestEvidence, formatTestFailure } from './test-evidence-format.mjs';

const runCommand = promisify(execFile);

export const defaultTestExecutor = runCommand;

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
    const result = await executeNpmTest(cwd, timeout, execute, platform, environment);
    return formatTestEvidence(
      result,
      execute === defaultTestExecutor,
      redact,
      normalizeExecutionResult,
      resolveResultCode,
    );
  } catch (cause) {
    return formatTestFailure(cause, timeout, redact);
  }
}
