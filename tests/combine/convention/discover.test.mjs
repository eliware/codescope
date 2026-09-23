import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { discoverConventionFiles } from '../../../src/combine/convention/discover.mjs';

test('reports a convention discovery failure with context', async () => {
  await expect(discoverConventionFiles('C:\\missing', {
    readDirectory: async () => { throw Object.assign(new Error('missing'), { code: 'ENOENT' }); },
    platform: 'win32',
  })).rejects.toThrow(/Unable to discover convention evidence/);
});

test('discovers convention JSON files on the host platform', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-conventions-'));
  try {
    await mkdir(path.join(root, 'specs'));
    await writeFile(path.join(root, 'specs', 'general.json'), '{}');
    await expect(discoverConventionFiles(root)).resolves.toMatchObject({ files: ['general.json'] });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('treats a non-directory convention root as unavailable', async () => {
  const file = await mkdtemp(path.join(os.tmpdir(), 'codescope-conventions-'));
  try {
    await writeFile(file + '.root', '{}');
    await expect(discoverConventionFiles(file + '.root')).resolves.toBeUndefined();
  } finally {
    await rm(file, { recursive: true, force: true });
    await rm(file + '.root', { force: true });
  }
});
