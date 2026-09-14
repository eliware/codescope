import { describeOtherFiles } from '../../src/combine/other-files.mjs';

const inspectRegularFile = async () => ({ isSymbolicLink: () => false, isFile: () => true });

test('describes unsupplied text and binary files while excluding supplied content', async () => {
  const files = new Map([
    ['notes.txt', 'a\nb'],
    ['image.dat', Buffer.from([0, 1, 2])],
    ['src/app.mjs', 'code'],
    ['README.md', 'docs'],
  ]);
  const result = await describeOtherFiles('repo', [...files.keys()], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async (file) => ({ data: files.get(file.split(/[\\/]/u).at(-1)), truncated: false }),
  });
  expect(result).toEqual(['image.dat | binary | 3 bytes', 'notes.txt | text | 2 lines | 3 bytes']);
});

test('returns no entries when all files are supplied elsewhere', async () => {
  await expect(
    describeOtherFiles('repo', ['package.json', 'README.md', '.github/ci.yml', 'src/app.mjs']),
  ).resolves.toEqual([]);
});

test('applies the metadata limit independently to each file', async () => {
  const result = await describeOtherFiles(
    'repo',
    ['large-one.txt', 'large-two.txt'],
    {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async () => ({ data: Buffer.alloc(100_001, 'x'), truncated: true }),
    },
  );
  expect(result).toEqual([
    'large-one.txt | omitted | at least 100001 sampled bytes | per-file metadata limit reached',
    'large-two.txt | omitted | at least 100001 sampled bytes | per-file metadata limit reached',
  ]);
});

test('rejects injected results beyond the bounded sample', async () => {
  await expect(
    describeOtherFiles('repo', ['large.txt'], {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async () => ({ data: Buffer.alloc(200_000, 'x'), truncated: true }),
    }),
  ).rejects.toThrow(/sample boundary/);
});

test('checks actual bytes after reading files', async () => {
  const reads = [];
  const result = await describeOtherFiles('repo', ['first.txt', 'second.txt'], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async (file) => {
      reads.push(file);
      return { data: file.endsWith('first.txt') ? Buffer.alloc(100_001, 'x') : 'x', truncated: file.endsWith('first.txt') };
    },
  });
  expect(result).toContain(
    'first.txt | omitted | at least 100001 sampled bytes | per-file metadata limit reached',
  );
  expect(result).toContain('second.txt | text | 1 lines | 1 bytes');
  expect(reads).toHaveLength(2);
});

test('rejects oversized data without a truthful truncation flag', async () => {
  await expect(describeOtherFiles('repo', ['large.txt'], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async () => ({ data: Buffer.alloc(100_001, 'x'), truncated: false }),
  })).rejects.toThrow(/oversized data without truncated=true/);
});

test('omits a file that grows beyond the per-file metadata limit', async () => {
  const result = await describeOtherFiles('repo', ['growing.txt', 'later.txt'], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async (file) => ({
      data: file.endsWith('growing.txt') ? Buffer.alloc(100_001, 'x') : 'later',
      truncated: file.endsWith('growing.txt'),
    }),
  });
  expect(result).toContain('growing.txt | omitted | at least 100001 sampled bytes | per-file metadata limit reached');
  expect(result).toContain('later.txt | text | 1 lines | 5 bytes');
});

test('allows multiple files when each is within the per-file limit', async () => {
  const result = await describeOtherFiles('repo', ['first.txt', 'second.txt'], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async (file) => ({
      data: file.endsWith('first.txt') ? 'first' : 'second',
      truncated: false,
    }),
  });
  expect(result).toEqual([
    'first.txt | text | 1 lines | 5 bytes',
    'second.txt | text | 1 lines | 6 bytes',
  ]);
});

test('uses bounded metadata concurrency while preserving sorted output', async () => {
  let active = 0;
  let maximum = 0;
  const result = await describeOtherFiles('repo', ['b.txt', 'a.txt', 'c.txt'], {
    inspectFile: inspectRegularFile,
    concurrency: 2,
    readOtherFileContents: async () => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;
      return { data: 'text', truncated: false };
    },
  });
  expect(maximum).toBe(2);
  expect(result.map((entry) => entry.split(' | ')[0])).toEqual(['a.txt', 'b.txt', 'c.txt']);
});

test('keeps equal normalized inventory paths deterministic', async () => {
  const result = await describeOtherFiles('repo', ['same.txt', 'same.txt'], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async () => ({ data: 'same', truncated: false }),
  });
  expect(result).toHaveLength(2);
});

test('uses explicit Windows path semantics for Windows inventory roots', async () => {
  const result = await describeOtherFiles('C:\\repo', ['notes.txt'], {
    platform: 'win32',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    readOtherFileContents: async () => ({ data: 'notes', truncated: false }),
  });
  expect(result[0]).toContain('notes.txt');
});

test('formats in-limit data even when a reader reports truncation', async () => {
  const result = await describeOtherFiles('repo', ['notes.txt'], {
    inspectFile: inspectRegularFile,
    readOtherFileContents: async () => ({ data: 'notes', truncated: true }),
  });
  expect(result[0]).toContain('notes.txt');
  expect(result[0]).not.toContain('per-file metadata limit reached');
});

test('uses POSIX path semantics when explicitly selected', async () => {
  const result = await describeOtherFiles('repo', ['notes.txt'], {
    platform: 'linux',
    inspectFile: inspectRegularFile,
    readOtherFileContents: async () => ({ data: 'notes', truncated: false }),
  });
  expect(result[0]).toContain('notes.txt');
});

test('rejects an invalid bounded-reader result', async () => {
  await expect(
    describeOtherFiles('repo', ['notes.txt'], { inspectFile: inspectRegularFile, readOtherFileContents: async () => 'notes' }),
  ).rejects.toThrow('must return { data, truncated }');
  await expect(
    describeOtherFiles('repo', ['notes.txt'], {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async () => ({ data: 'notes' }),
    }),
  ).rejects.toThrow('must return { data, truncated }');
});

test('rejects invalid metadata concurrency values', async () => {
  for (const concurrency of [0, 1.5, Number.NaN, '2'])
    await expect(describeOtherFiles('repo', ['notes.txt'], { concurrency })).rejects.toThrow(/concurrency/);
});

test('rejects inventory paths that escape the review root', async () => {
  await expect(
    describeOtherFiles('repo', ['../outside.txt'], {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async () => ({ data: 'outside', truncated: false }),
    }),
  ).rejects.toThrow(/escapes review root/);
  await expect(
    describeOtherFiles('repo', [42], {
      readOtherFileContents: async () => ({ data: 'outside', truncated: false }),
    }),
  ).rejects.toThrow(/must be strings/);
  await expect(
    describeOtherFiles('repo', ['C:\\outside.txt'], {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async () => ({ data: 'outside', truncated: false }),
    }),
  ).rejects.toThrow(/escapes review root/);
  await expect(
    describeOtherFiles('repo', ['/outside.txt'], {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async () => ({ data: 'outside', truncated: false }),
    }),
  ).rejects.toThrow(/escapes review root/);
});

test('normalizes inventory separators before resolving relative paths', async () => {
  const readPaths = [];
  await expect(
    describeOtherFiles('repo', ['nested\\notes.txt'], {
      inspectFile: inspectRegularFile,
      readOtherFileContents: async (file) => {
        readPaths.push(file);
        return { data: 'notes', truncated: false };
      },
    }),
  ).resolves.toEqual(['nested/notes.txt | text | 1 lines | 5 bytes']);
  expect(readPaths[0]).toMatch(/[\\/]nested[\\/]notes\.txt$/u);
});

test('rejects symlinked inventory entries before reading them', async () => {
  let read = false;
  await expect(
    describeOtherFiles('repo', ['notes.txt'], {
      inspectFile: async () => ({ isSymbolicLink: () => true, isFile: () => false }),
      readOtherFileContents: async () => {
        read = true;
        return { data: 'notes', truncated: false };
      },
    }),
  ).rejects.toThrow(/symlinked inventory files/);
  expect(read).toBe(false);
});

test('rejects non-file inventory entries before reading them', async () => {
  await expect(
    describeOtherFiles('repo', ['notes.txt'], {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
      readOtherFileContents: async () => ({ data: 'notes', truncated: false }),
    }),
  ).rejects.toThrow(/not a regular file/);
});
