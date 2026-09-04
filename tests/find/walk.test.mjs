import { walkDirectories } from '../../src/find/walk.mjs';

test('walks directories, skips entries, and reports files', async () => {
  const files = [];
  await walkDirectories('root', {
    readEntries: async (directory) => directory === 'root'
      ? [{ name: 'nested', kind: 'directory' }, { name: 'skip', skip: true }, { name: 'a.mjs', kind: 'file' }]
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
