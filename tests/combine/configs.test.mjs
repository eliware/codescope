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
    readFileContents: async (file) =>
      files.get(file.replace(/^.*?(?=\.github[\\/]|\.knit[\\/])/u, '').replaceAll('\\', '/')),
  });
  expect(result).toContain('===== .github/workflow.yml =====\n1 a\n2 b');
  expect(result).toContain('[truncated after 200 lines; remaining config omitted]');
  expect(result).not.toContain('image.bin');
});

test('returns an empty section when no text config is present', async () => {
  await expect(combineConfigFiles('repo', { inventory: ['README.md'] })).resolves.toBe('');
});
