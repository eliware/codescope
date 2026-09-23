import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readConfigEntry } from '../../../src/combine/config/read-config-entry.mjs';

const regular = { isSymbolicLink: () => false, isFile: () => true };

test('uses default inspection and bounded readers', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-config-'));
  try {
    await mkdir(path.join(root, '.github'), { recursive: true });
    await writeFile(path.join(root, '.github', 'ci.yml'), 'default');
    await expect(readConfigEntry(root, '.github/ci.yml')).resolves.toContain('1 default');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reads and numbers bounded configuration text', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => 'first\nsecond',
    platform: 'posix',
  })).resolves.toContain('1 first\n2 second');
});

test('omits binary configuration content', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => Buffer.from([0, 1]),
    platform: 'posix',
  })).resolves.toBe('');
});

test('rejects invalid metadata and reader results', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => ({ isSymbolicLink: () => true }),
  })).rejects.toThrow(/symlinked/);
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => ({ data: 'x' }),
  })).rejects.toThrow(/reader must return/);
});

test('rejects invalid configuration data types', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => 42,
  })).rejects.toThrow(/reader data must be text or bytes/);
});

test('rejects non-file configuration entries', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
  })).rejects.toThrow(/not a regular file/);
});

test('rejects readers that exceed the extra-byte boundary', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => ({ data: Buffer.alloc(100_002, 'x'), truncated: true }),
  })).rejects.toThrow(/100001-byte/);
});

test('rejects unmarked readers beyond the byte limit', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => Buffer.alloc(100_001, 'x'),
  })).rejects.toThrow(/100000-byte/);
});

test('reports line truncation separately from byte truncation', async () => {
  const text = `${Array.from({ length: 201 }, (_, index) => `line-${index}`).join('\n')}\n`;
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => text,
  })).resolves.toContain('truncated after 200 lines');
});

test('reports byte truncation when the bounded reader marks a short file', async () => {
  await expect(readConfigEntry('repo', '.github/ci.yml', {
    inspectFile: async () => regular,
    readFileContents: async () => ({ data: Buffer.alloc(100_000, 'x'), truncated: true }),
  })).resolves.toContain('truncated after the per-file byte limit');
});
