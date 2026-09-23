import { selectFiles } from '../../src/combine/select-files.mjs';

test('filters supplied files by extension and test mode', async () => {
  await expect(selectFiles('/repo', '.mjs', {
    files: ['src/app.mjs', 'tests/app.test.mjs', 'guide.md'],
    noTests: true,
  })).resolves.toEqual(['src/app.mjs']);
});

test('discovers files when no inventory is supplied', async () => {
  await expect(selectFiles('/repo', '.mjs', { readDirectory: async () => [] })).resolves.toEqual([]);
});
