import path from 'node:path';
import { existsSync } from 'node:fs';

const isNpmExecPath = (value) =>
  typeof value === 'string' &&
  path.isAbsolute(value) &&
  /(?:^|[\\/])npm(?:-cli)?\.js$/iu.test(value);

export function resolveNpmCommand(
  platform = process.platform,
  npmExecPath = process.env.npm_execpath,
  bundledNpm = path.join(
    path.dirname(process.execPath),
    'node_modules',
    'npm',
    'bin',
    'npm-cli.js',
  ),
) {
  const candidates = [];
  if (isNpmExecPath(npmExecPath) && existsSync(npmExecPath))
    candidates.push([process.execPath, [npmExecPath, 'test'], false]);
  if (existsSync(bundledNpm)) candidates.push([process.execPath, [bundledNpm, 'test'], false]);
  candidates.push([platform === 'win32' ? 'npm.cmd' : 'npm', ['test'], false]);
  return candidates;
}
