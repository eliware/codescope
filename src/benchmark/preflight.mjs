import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { runProcess } from './runner.mjs';

export async function runBenchmarkPreflight(
  { cwd, logDirectory },
  run = runProcess,
  makeDirectory = mkdir,
  save = writeFile,
  platform = process.platform,
) {
  await makeDirectory(logDirectory, { recursive: true });
  const command = platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = await run(command, ['test'], cwd);
  await save(`${logDirectory}/npm-test.log`, result.output, 'utf8');
  return result;
}
