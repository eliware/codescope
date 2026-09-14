import { walkDirectories } from '../../src/find/walk.mjs';

test('walks directories, skips entries, and reports files', async () => {
  const files = [];
  await walkDirectories('root', {
    readEntries: async (directory) =>
      directory === 'root'
        ? [
            { name: 'nested', kind: 'directory' },
            { name: 'skip', skip: true },
            { name: 'a.mjs', kind: 'file' },
          ]
        : [{ name: 'b.mjs', kind: 'file' }],
    classify: (entry) => ({
      skip: entry.skip,
      isDirectory: entry.kind === 'directory',
      isFile: entry.kind === 'file',
    }),
    shouldDescend: () => true,
    resolveChild: (directory, name) => `${directory}/${name}`,
    onFile: (name, directory) => files.push(`${directory}/${name}`),
  });
  expect(files).toEqual(['root/a.mjs', 'root/nested/b.mjs']);
});

test('reads directories with bounded concurrency and deterministic file order', async () => {
  let active = 0;
  let maximum = 0;
  const files = [];
  await walkDirectories('root', {
    concurrency: 2,
    readEntries: async (directory) => {
      active += 1;
      maximum = Math.max(maximum, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;
      return directory === 'root'
        ? [
            { name: 'z', kind: 'directory' },
            { name: 'a', kind: 'directory' },
          ]
        : [{ name: `${directory.at(-1)}.mjs`, kind: 'file' }];
    },
    classify: (entry) => ({
      skip: false,
      isDirectory: entry.kind === 'directory',
      isFile: entry.kind === 'file',
    }),
    shouldDescend: () => true,
    resolveChild: (directory, name) => `${directory}/${name}`,
    onFile: (name, directory) => files.push(`${directory}/${name}`),
  });
  expect(maximum).toBe(2);
  expect(files).toEqual(['root/a/a.mjs', 'root/z/z.mjs']);
});
