export function formatTestEvidence(result, executeWasDefault, redact, normalize, resultCode) {
  const output = redact(`${String(result.stdout ?? '')}${String(result.stderr ?? '')}`);
  const code = resultCode(normalize(result, executeWasDefault));
  const status = code === 0 ? 'pass' : Number.isInteger(code) ? 'fail' : 'unknown';
  return `===== npm test =====\nstatus: ${status}\n${code === 0 ? 'exit code: 0' : `exit code: ${code}`}\n${output}`;
}

export function formatTestFailure(cause, timeout, redact) {
  const output = redact(
    `${String(cause.stdout ?? '')}${String(cause.stderr ?? '')}${
      cause.message ? String(cause.message) : ''
    }`,
  );
  const status = cause.killed
    ? `timed out after ${timeout / 1000} seconds`
    : cause.code === 'ENOENT'
      ? 'runner error: npm test command was not found'
      : `runner failure: npm test could not complete (${cause.code ?? 'unknown'})`;
  return `===== npm test =====\nstatus: fail\n${status}\n${output}`;
}
