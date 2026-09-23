import path from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { readInventoryEntry } from '../../../src/combine/inventory/read-entry.mjs';

const regular = { isSymbolicLink: () => false, isFile: () => true };
const options = { pathApi: path.posix, inspectFile: async () => regular };

test('formats a regular inventory entry', async () => {
  await expect(readInventoryEntry('repo', 'notes.txt', { ...options, readOtherFileContents: async () => ({ data: 'hello', truncated: false }) }))
    .resolves.toContain('notes.txt');
});

test('reports bounded inventory entries as omitted', async () => {
  await expect(readInventoryEntry('repo', 'notes.txt', { ...options, readOtherFileContents: async () => ({ data: 'sample', truncated: true }) }))
    .rejects.toThrow(/in-limit/);
});

test('rejects unsafe metadata and invalid reader output', async () => {
  await expect(readInventoryEntry('repo', 'notes.txt', { ...options, inspectFile: async () => ({ isSymbolicLink: () => true }), readOtherFileContents: async () => ({ data: '', truncated: false }) })).rejects.toThrow(/symlinked/);
  await expect(readInventoryEntry('repo', 'notes.txt', { ...options, readOtherFileContents: async () => 'notes' })).rejects.toThrow(/reader/);
});

test('rejects non-files and invalid bounded samples', async () => {
  await expect(readInventoryEntry('repo', 'notes.txt', {
    ...options, inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
    readOtherFileContents: async () => ({ data: '', truncated: false }),
  })).rejects.toThrow(/regular file/);
  await expect(readInventoryEntry('repo', 'notes.txt', {
    ...options, readOtherFileContents: async () => ({ data: Buffer.alloc(100_002), truncated: true }),
  })).rejects.toThrow(/100001-byte/);
  await expect(readInventoryEntry('repo', 'notes.txt', {
    ...options, readOtherFileContents: async () => ({ data: Buffer.alloc(100_001), truncated: false }),
  })).rejects.toThrow(/without truncated/);
  await expect(readInventoryEntry('repo', 'notes.txt', {
    ...options, readOtherFileContents: async () => ({ data: 'short', truncated: true }),
  })).rejects.toThrow(/in-limit/);
});

test('returns omitted metadata for a bounded truncated sample', async () => {
  await expect(readInventoryEntry('repo', 'large.txt', {
    ...options, readOtherFileContents: async () => ({ data: Buffer.alloc(100_001), truncated: true }),
  })).resolves.toContain('omitted');
});

test('uses the default file inspector when no inspector is injected', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-inventory-'));
  try {
    await writeFile(path.join(root, 'notes.txt'), 'notes');
    await expect(readInventoryEntry(root, 'notes.txt', {
      pathApi: path.win32,
      readOtherFileContents: async () => ({ data: 'notes', truncated: false }),
    })).resolves.toContain('notes.txt');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
