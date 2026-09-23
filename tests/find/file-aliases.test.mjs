import { findAllFiles, findMdFiles, findMjsFiles } from '../../src/find/file-aliases.mjs';

test('exposes the supported finder extension strategies', async () => {
  const readDirectory = async () => [];
  await expect(findMjsFiles('/repo', { readDirectory })).resolves.toEqual([]);
  await expect(findMdFiles('/repo', { readDirectory })).resolves.toEqual([]);
  await expect(findAllFiles('/repo', { readDirectory })).resolves.toEqual([]);
});
