import process from 'node:process';
import { resolveNpmCommand } from './npm-command.mjs';

export async function executeNpmTest(cwd, timeout, execute, platform, environment) {
  let result;
  let lastCause;
  for (const [executable, args, shell] of resolveNpmCommand(platform, environment.npm_execpath)) {
    try {
      const env = { ...environment, npm_node_execpath: process.execPath };
      if (typeof args[0] === 'string' && args[0].endsWith('npm-cli.js')) env.npm_execpath = args[0];
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
  return result;
}
