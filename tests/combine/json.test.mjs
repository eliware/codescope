import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { combineJsonFiles } from '../../src/combine/json.mjs';

test('includes scoped JSON while excluding package locks and unrelated JSON', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-json-'));
  try {
    await mkdir(path.join(root, 'specs'));
    await mkdir(path.join(root, 'tmp'));
    await writeFile(path.join(root, 'root.json'), '{"root":true}');
    await writeFile(path.join(root, 'package-lock.json'), '{"lockfileVersion":3}');
    await writeFile(path.join(root, 'specs', 'contract.json'), '{"spec":true}');
    await writeFile(path.join(root, 'tmp', 'private.json'), '{"private":true}');
    const result = await combineJsonFiles(root);
    expect(result).toContain('root.json');
    expect(result).toContain('specs/contract.json');
    expect(result).not.toContain('package-lock.json');
    expect(result).not.toContain('tmp/private.json');
    await expect(combineJsonFiles(root, { maxChars: 1000 })).resolves.toContain('root.json');
    await expect(combineJsonFiles('repo', {
      platform: 'linux',
      readDirectory: async () => [],
    })).resolves.toBe('');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
