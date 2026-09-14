import { combineAllFiles, combineSelectedFiles } from '../../src/combine/all.mjs';

const options = {
  readFileContents: async (file) =>
    file.endsWith('package.json') ? '{"name":"fixture"}\n' : 'content\n',
  inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  readDirectory: async () => [],
};

test('combines package metadata for the all-context contract', async () => {
  const result = await combineAllFiles('/repo', options);
  expect(result).toContain('===== package.json =====');
});

test('combines all files with default options', async () => {
  await expect(combineAllFiles(process.cwd())).resolves.toContain('package.json');
});

test('uses native readers when adapters are not supplied', async () => {
  await expect(
    combineAllFiles(process.cwd(), { readDirectory: async () => [] }),
  ).resolves.toContain('===== package.json =====');
});

test('combines only selected source groups when requested', async () => {
  const result = await combineSelectedFiles('/repo', { ...options, implementation: true });
  expect(result).toContain('===== package.json =====');
  await expect(
    combineSelectedFiles('/repo', {
      ...options,
      tests: true,
      docs: true,
    }),
  ).resolves.not.toContain('test output');
});

test('anchors metadata first, places inventory in the middle, and ends with source evidence', async () => {
  const names = [
    'package.json',
    '.github/ci.yml',
    'guide.md',
    'app.mjs',
    'app.test.mjs',
    'data.json',
    'image.bin',
  ];
  const result = await combineAllFiles('/repo', {
    readDirectory: async (directory) =>
      directory.endsWith('repo')
        ? [
            ...names
              .filter((name) => !name.includes('/'))
              .map((name) => ({ name, isFile: () => true })),
            { name: '.github', isDirectory: () => true },
          ]
        : [{ name: 'ci.yml', isFile: () => true }],
    readFileContents: async (file) => {
      const name = file.split(/[\\/]/u).pop();
      if (name === 'package.json') return '{}';
      if (name === 'image.bin') return Buffer.from([0, 1]);
      return name.endsWith('.yml') ? 'name: check' : name.endsWith('.md') ? '# docs' : 'code';
    },
    readOtherFileContents: async (file) => {
      const name = file.split(/[\\/]/u).pop();
      return { data: name === 'image.bin' ? Buffer.from([0, 1]) : 'data', truncated: false };
    },
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toContain('===== repository configuration =====');
  expect(result).toContain('===== .github/ci.yml =====');
  expect(result).toContain('data.json | text');
  expect(result).toContain('image.bin | binary | 2 bytes');
  expect(result.indexOf('===== package.json =====')).toBeLessThan(
    result.indexOf('===== other files (names and sizes only) ====='),
  );
  expect(result.indexOf('===== other files (names and sizes only) =====')).toBeLessThan(
    result.indexOf('===== guide.md ====='),
  );
  expect(result.indexOf('===== guide.md =====')).toBeLessThan(
    result.indexOf('===== app.mjs ====='),
  );
  expect(result.indexOf('===== app.mjs =====')).toBeLessThan(
    result.indexOf('===== app.test.mjs ====='),
  );
  await expect(
    combineAllFiles('/repo', {
      readDirectory: async () => [],
      readFileContents: async () => '{}',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      maxChars: 1,
    }),
  ).rejects.toThrow(/character limit/);
});

test('reports package and configuration read failures clearly', async () => {
  await expect(
    combineAllFiles('/repo', {
      readDirectory: async () => [],
      readFileContents: async () => null,
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow(/non-string/);
  await expect(
    combineAllFiles('/repo', {
      readDirectory: async () => [],
      readFileContents: async () => {
        throw 'package failed';
      },
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow(/package failed/);
  await expect(
    combineAllFiles('/repo', {
      readDirectory: async () => [],
      readFileContents: async () => '{}',
      validateSymlinks: true,
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow(/symlinked package/);
});

test('omits binary configs and truncates long text configs', async () => {
  const longConfig = Array.from({ length: 201 }, (_, index) => `line-${index + 1}`).join('\n');
  const result = await combineAllFiles('/repo', {
    readDirectory: async (directory) =>
      directory.endsWith('repo')
        ? [{ name: '.github', isDirectory: () => true }]
        : [
            { name: 'large.yml', isFile: () => true },
            { name: 'binary.yml', isFile: () => true },
          ],
    readFileContents: async (file) =>
      file.endsWith('package.json')
        ? '{}'
        : file.endsWith('binary.yml')
          ? Buffer.from([0, 1])
          : longConfig,
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toContain('[truncated after 200 lines; remaining config omitted]');
  expect(result).not.toContain('binary.yml');
});

test('enforces selected-source limits', async () => {
  await expect(
    combineSelectedFiles('/repo', {
      maxChars: 1,
      readDirectory: async () => [
        { name: 'app.mjs', isFile: () => true },
        { name: 'guide.md', isFile: () => true },
      ],
      readFileContents: async () => 'content',
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    }),
  ).rejects.toThrow(/character limit/);
});
