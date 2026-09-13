import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readFileUpToLimit } from '../../src/combine/read-file-up-to-limit.mjs';
import { MAX_OTHER_FILE_BYTES } from '../../src/combine/other-policy.mjs';

test('reads at most one byte beyond the configured limit', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-limit-'));
  const file = path.join(directory, 'large.txt');
  try {
    await writeFile(file, Buffer.alloc(10, 'x'));
    await expect(readFileUpToLimit(file, 4)).resolves.toMatchObject({
      data: Buffer.alloc(5, 'x'),
      truncated: true,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('returns the complete file when it fits within the limit', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-limit-'));
  const file = path.join(directory, 'small.txt');
  try {
    await writeFile(file, 'small');
    await expect(readFileUpToLimit(file, 10)).resolves.toMatchObject({
      data: await readFile(file),
      truncated: false,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('returns an overflow byte for a file larger than the metadata limit', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-limit-'));
  const file = path.join(directory, 'oversized.txt');
  try {
    await writeFile(file, Buffer.alloc(MAX_OTHER_FILE_BYTES + 2, 'x'));
    const result = await readFileUpToLimit(file, MAX_OTHER_FILE_BYTES);
    expect(result.data).toHaveLength(MAX_OTHER_FILE_BYTES + 1);
    expect(result.truncated).toBe(true);
    expect(result.data.every((byte) => byte === 'x'.charCodeAt(0))).toBe(true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
