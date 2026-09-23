import path from 'node:path';
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
