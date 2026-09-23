import { combineAllFiles } from '../../src/combine/all.mjs';

const options = {
  readFileContents: async (file) => file.endsWith('package.json') ? '{"name":"fixture"}\n' : 'content\n',
  inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  readDirectory: async () => [],
};

test('combines package metadata with default readers and adapters', async () => {
  await expect(combineAllFiles('/repo', options)).resolves.toContain('===== package.json =====');
  await expect(combineAllFiles(process.cwd())).resolves.toContain('package.json');
  await expect(combineAllFiles(process.cwd(), { readDirectory: async () => [] }))
    .resolves.toContain('===== package.json =====');
});

test('preserves the all-context section ordering', async () => {
  const names = ['package.json', '.github/ci.yml', 'guide.md', 'app.mjs', 'app.test.mjs', 'data.json', 'image.bin'];
  const result = await combineAllFiles('/repo', {
    readDirectory: async (directory) => directory.endsWith('repo')
      ? [...names.filter((name) => !name.includes('/')).map((name) => ({ name, isFile: () => true })), { name: '.github', isDirectory: () => true }]
      : [{ name: 'ci.yml', isFile: () => true }],
    readFileContents: async (file) => {
      const name = file.split(/[\\/]/u).pop();
      if (name === 'package.json') return '{}';
      if (name === 'image.bin') return Buffer.from([0, 1]);
      return name.endsWith('.yml') ? 'name: check' : name.endsWith('.md') ? '# docs' : 'code';
    },
    readOtherFileContents: async (file) => ({
      data: file.endsWith('image.bin') ? Buffer.from([0, 1]) : 'data', truncated: false,
    }),
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
  });
  expect(result).toContain('===== repository configuration =====');
  expect(result).toContain('===== .github/ci.yml =====');
  expect(result.indexOf('===== package.json =====')).toBeLessThan(result.indexOf('===== guide.md ====='));
  expect(result.indexOf('===== guide.md =====')).toBeLessThan(result.indexOf('===== app.mjs ====='));
  expect(result.indexOf('===== app.mjs =====')).toBeLessThan(result.indexOf('===== app.test.mjs ====='));
});

test('propagates the all-context character limit', async () => {
  await expect(combineAllFiles('/repo', {
    readDirectory: async () => [],
    readFileContents: async () => '{}',
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    maxChars: 1,
  })).rejects.toThrow(/character limit/);
});
