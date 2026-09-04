import {
  collectTestResults,
  redactTestOutput,
  resolveNpmCommand,
  testEvidenceBlocks,
} from '../../src/review/test-results.mjs';

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

test('uses the active npm executable path when provided', async () => {
  const previous = process.env.npm_execpath;
  process.env.npm_execpath = process.execPath;
  const calls = [];
  await collectTestResults('repo', 100, async (...args) => {
    calls.push(args);
    return { stdout: '', stderr: '', code: 0 };
  });
  if (previous === undefined) delete process.env.npm_execpath;
  else process.env.npm_execpath = previous;
  expect(calls[0][0]).toBe(process.execPath);
  expect(calls[0][1][0]).toBe(process.execPath);
  delete process.env.npm_execpath;
  const fallbackCalls = [];
  await collectTestResults('repo', 100, async (...args) => {
    fallbackCalls.push(args);
    return { stdout: '', stderr: '', code: 0 };
  });
  if (previous !== undefined) process.env.npm_execpath = previous;
  expect(fallbackCalls[0][0]).toBe(process.execPath);
  expect(fallbackCalls[0][1][0]).toContain('npm-cli.js');
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

test('resolves the Windows npm executable explicitly', () => {
  const previous = process.env.npm_execpath;
  delete process.env.npm_execpath;
  expect(resolveNpmCommand('win32', undefined)[0][0]).toBe(process.execPath);
  if (previous !== undefined) process.env.npm_execpath = previous;
});

test('resolves npm on non-Windows hosts', () => {
  const previous = process.env.npm_execpath;
  delete process.env.npm_execpath;
  expect(resolveNpmCommand('linux', undefined)[0][0]).toBe(process.execPath);
  if (previous !== undefined) process.env.npm_execpath = previous;
});

test('uses npm_execpath with a non-Windows platform', () => {
  const previous = process.env.npm_execpath;
  process.env.npm_execpath = process.execPath;
  expect(resolveNpmCommand('linux', process.execPath).length).toBeGreaterThan(1);
  if (previous === undefined) delete process.env.npm_execpath;
  else process.env.npm_execpath = previous;
});

test('falls back to the platform npm command when bundled npm is absent', () => {
  expect(resolveNpmCommand('linux', null, 'missing/npm-cli.js')[0][0]).toBe('npm');
  expect(resolveNpmCommand('win32', null, 'missing/npm-cli.js')[0][0]).toBe('npm.cmd');
});

test('rejects invalid timeout and non-string runner output', async () => {
  await expect(collectTestResults('repo', 0, async () => ({ stdout: '' }))).rejects.toThrow(
    /positive/,
  );
  await expect(
    collectTestResults('repo', 1000, async () => ({ stdout: '', stderr: '' })),
  ).resolves.toContain('exit code: 0');
});
