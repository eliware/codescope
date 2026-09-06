import {
  collectTestResults,
  redactTestOutput,
  normalizeExecutionResult,
  resolveNpmCommand,
  resolveResultCode,
  testEvidenceBlocks,
} from '../../src/review/test-results.mjs';
import path from 'node:path';

test('resolves explicit and missing runner exit codes safely', () => {
  expect(resolveResultCode({ code: 0 })).toBe(0);
  expect(resolveResultCode({})).toBe('unknown');
});

test('normalizes only the built-in executor result', () => {
  const result = { stdout: 'x' };
  expect(normalizeExecutionResult(result, false)).toBe(result);
  expect(normalizeExecutionResult(result, true)).toMatchObject({ code: 0 });
  expect(normalizeExecutionResult({ code: 2 }, true).code).toBe(2);
});

test('identifies failed and timed-out test evidence', () => {
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 1')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\ntimed out after 30 seconds')).toBe(true);
  expect(testEvidenceBlocks('===== npm test =====\nexit code: 0')).toBe(false);
});

test('redacts common credentials', () => {
  expect(redactTestOutput('TOKEN=secret sk-test-value')).not.toContain('secret');
});

test('formats successful and timed-out test results', async () => {
  await expect(
    collectTestResults('repo', 100, async () => ({ stdout: 'ok', stderr: '', code: 0 })),
  ).resolves.toContain('exit code: 0');
  await expect(
    collectTestResults('repo', 100, async () => {
      throw { killed: true, stdout: '', stderr: '' };
    }),
  ).resolves.toContain('timed out');
  await expect(
    collectTestResults('repo', 100, async () => ({
      stdout: undefined,
      stderr: 'warning',
      code: 2,
    })),
  ).resolves.toContain('exit code: 2');
  await expect(
    collectTestResults('repo', 100, async () => ({
      stdout: 'only stdout',
      stderr: undefined,
      code: 0,
    })),
  ).resolves.toContain('only stdout');
  await expect(
    collectTestResults('repo', 100, async () => {
      throw { killed: false, code: 3 };
    }),
  ).resolves.toContain('exit code: 3');
  await expect(
    collectTestResults('repo', 100, async () => {
      throw { killed: false };
    }),
  ).resolves.toContain('exit code: unknown');
});

test('uses the active npm CLI path when provided', async () => {
  const previous = process.env.npm_execpath;
  try {
    process.env.npm_execpath = path.join(process.cwd(), 'npm-cli.js');
    const calls = [];
    await collectTestResults('repo', 100, async (...args) => {
      calls.push(args);
      return { stdout: '', stderr: '', code: 0 };
    });
    expect(calls[0][0]).toBe(process.execPath);
    expect(calls[0][1][0]).toContain('npm-cli.js');
  } finally {
    if (previous === undefined) delete process.env.npm_execpath;
    else process.env.npm_execpath = previous;
  }
});

test('reports when all npm resolution candidates are missing', async () => {
  const previous = process.env.npm_execpath;
  delete process.env.npm_execpath;
  const result = await collectTestResults('repo', 100, async () => {
    throw { code: 'ENOENT' };
  });
  if (previous !== undefined) process.env.npm_execpath = previous;
  expect(result).toContain('runner error: npm test command was not found');
});

test('tries the next executable after a recoverable launch failure', async () => {
  let calls = 0;
  const result = await collectTestResults('repo', 100, async () => {
    calls += 1;
    if (calls === 1) throw { code: 'EACCES' };
    return { stdout: 'ok', stderr: '', code: 0 };
  });
  expect(calls).toBe(2);
  expect(result).toContain('exit code: 0');
});

test('preserves non-launch failures from the test runner', async () => {
  await expect(
    collectTestResults('repo', 100, async () => {
      throw { code: 'EPIPE' };
    }),
  ).resolves.toContain('exit code: EPIPE');
});

test('resolves the Windows npm executable explicitly', () => {
  const previous = process.env.npm_execpath;
  delete process.env.npm_execpath;
  const [executable, args] = resolveNpmCommand('win32', undefined)[0];
  expect(args.at(-1)).toBe('test');
  expect([process.execPath, 'npm.cmd']).toContain(executable);
  if (previous !== undefined) process.env.npm_execpath = previous;
});

test('resolves npm on non-Windows hosts', () => {
  const previous = process.env.npm_execpath;
  delete process.env.npm_execpath;
  const [executable, args] = resolveNpmCommand('linux', undefined)[0];
  expect(args.at(-1)).toBe('test');
  expect([process.execPath, 'npm']).toContain(executable);
  if (previous !== undefined) process.env.npm_execpath = previous;
});

test('uses npm_execpath with a non-Windows platform', () => {
  const previous = process.env.npm_execpath;
  process.env.npm_execpath = process.execPath;
  expect([process.execPath, 'npm']).toContain(resolveNpmCommand('linux', process.execPath)[0][0]);
  if (previous === undefined) delete process.env.npm_execpath;
  else process.env.npm_execpath = previous;
});

test('falls back to the platform npm command when bundled npm is absent', () => {
  expect(resolveNpmCommand('linux', null, 'missing/npm-cli.js')[0][0]).toBe('npm');
  expect(resolveNpmCommand('win32', null, 'missing/npm-cli.js')[0][0]).toBe('npm.cmd');
});

test('uses the bundled npm runner when it exists', () => {
  const bundledRunner = path.resolve('package.json');
  const [executable, args] = resolveNpmCommand('linux', null, bundledRunner)[0];
  expect(executable).toBe(process.execPath);
  expect(args).toEqual([bundledRunner, 'test']);
});

test('rejects invalid timeout and treats missing runner status as unknown', async () => {
  await expect(collectTestResults('repo', 0, async () => ({ stdout: '' }))).rejects.toThrow(
    /positive/,
  );
  await expect(
    collectTestResults('repo', 1000, async () => ({ stdout: '', stderr: '' })),
  ).resolves.toContain('exit code: unknown');
});

test('uses the built-in test executor when none is supplied', async () => {
  await expect(collectTestResults(path.resolve('missing-test-workspace'), 1000)).resolves.toContain(
    '===== npm test =====',
  );
});

test('resolves npm candidates with default environment values', () => {
  expect(resolveNpmCommand().at(-1)[1]).toEqual(['test']);
});
