import { combineConfigFiles } from '../../src/combine/configs.mjs';

test('combines text GitHub and Knit configs with numbered, truncated content', async () => {
  const files = new Map([
    ['.github/workflow.yml', 'a\nb'],
    [
      '.knit/config.yml',
      `${Array.from({ length: 201 }, (_, index) => `line-${index + 1}`).join('\n')}`,
    ],
    ['.github/image.bin', Buffer.from([0, 1, 2])],
  ]);
  const result = await combineConfigFiles('repo', {
    inventory: [...files.keys()],
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    readFileContents: async (file) =>
      files.get(file.replace(/^.*?(?=\.github[\\/]|\.knit[\\/])/u, '').replaceAll('\\', '/')),
  });
  expect(result).toContain('===== .github/workflow.yml =====\n1 a\n2 b');
  expect(result).toContain('[truncated after 200 lines; remaining config omitted]');
  expect(result).not.toContain('image.bin');
});

test('accepts Windows separators in inventory configuration paths', async () => {
  await expect(combineConfigFiles('repo', {
    inventory: ['.github\\workflow.yml'],
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    readFileContents: async () => 'name: workflow',
  })).resolves.toContain('.github/workflow.yml');
});

test('rejects configuration paths outside the review root', async () => {
  await expect(combineConfigFiles('repo', {
    inventory: ['.github\\..\\..\\outside.yml'],
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    readFileContents: async () => 'outside',
  })).rejects.toThrow(/escapes review root/);
});

test('rejects Windows absolute configuration paths before filtering', async () => {
  await expect(combineConfigFiles('repo', {
    inventory: ['C:\\outside.yml'],
  })).rejects.toThrow(/escapes review root/);
});

test('rejects symlinked configuration files before reading them', async () => {
  let read = false;
  await expect(
    combineConfigFiles('repo', {
      inventory: ['.github/workflow.yml'],
      inspectFile: async () => ({ isSymbolicLink: () => true, isFile: () => false }),
      readFileContents: async () => {
        read = true;
        return 'name: workflow';
      },
    }),
  ).rejects.toThrow(/symlinked configuration files/);
  expect(read).toBe(false);
});

test('rejects non-file configuration entries before reading them', async () => {
  await expect(
    combineConfigFiles('repo', {
      inventory: ['.github/workflow.yml'],
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
      readFileContents: async () => 'name: workflow',
    }),
  ).rejects.toThrow(/not a regular file/);
});

test('returns an empty section when no text config is present', async () => {
  await expect(combineConfigFiles('repo', { inventory: ['README.md'] })).resolves.toBe('');
});

test('rejects missing inventory with default options', async () => {
  await expect(combineConfigFiles('repo')).rejects.toThrow();
});

test('reads configuration files in bounded batches while preserving inventory order', async () => {
  let active = 0;
  let maximum = 0;
  const result = await combineConfigFiles('repo', {
    inventory: ['.github/a.yml', '.github/b.yml', '.knit/c.yml'],
    concurrency: 2,
    inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
    readFileContents: async (file) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;
      return file.endsWith('a.yml') ? 'a' : file.endsWith('b.yml') ? 'b' : 'c';
    },
  });
  expect(maximum).toBe(2);
  expect(result.indexOf('===== .github/a.yml =====')).toBeLessThan(
    result.indexOf('===== .github/b.yml ====='),
  );
  expect(result.indexOf('===== .github/b.yml =====')).toBeLessThan(
    result.indexOf('===== .knit/c.yml ====='),
  );
});

test('rejects invalid configuration concurrency', async () => {
  await expect(
    combineConfigFiles('repo', { inventory: ['.github/ci.yml'], concurrency: 0 }),
  ).rejects.toThrow(/positive integer/);
});
