import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readFileUpToLimit } from '../../src/combine/read-file-up-to-limit.mjs';

test('reads at most one byte beyond the configured limit', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-limit-'));
  const file = path.join(directory, 'large.txt');
  try {
    await writeFile(file, Buffer.alloc(10, 'x'));
    await expect(readFileUpToLimit(file, 4)).resolves.toEqual(Buffer.alloc(5, 'x'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('returns the complete file when it fits within the limit', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-limit-'));
  const file = path.join(directory, 'small.txt');
  try {
    await writeFile(file, 'small');
    await expect(readFileUpToLimit(file, 10)).resolves.toEqual(await readFile(file));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
