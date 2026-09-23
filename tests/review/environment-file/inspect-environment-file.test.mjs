import { inspectEnvironmentFile } from '../../../src/review/environment-file/inspect-environment-file.mjs';

test('returns stable identity for a safe existing file', async () => {
  await expect(inspectEnvironmentFile('file', async () => ({
    dev: 1,
    ino: 2,
    isSymbolicLink: () => false,
  }))).resolves.toBe('1:2');
});

test('classifies an absent file as missing', async () => {
  const error = Object.assign(new Error('missing'), { code: 'ENOENT' });
  await expect(inspectEnvironmentFile('file', async () => { throw error; })).resolves.toBeNull();
});

test('wraps inspection failures with the environment path', async () => {
  await expect(inspectEnvironmentFile('file', async () => { throw new Error('denied'); }))
    .rejects.toThrow('Unable to inspect file: denied');
});

test('rejects symbolic links before identity capture', async () => {
  await expect(inspectEnvironmentFile('file', async () => ({ isSymbolicLink: () => true })))
    .rejects.toThrow(/symbolic link/);
});

test('preserves non-Error inspection causes', async () => {
  await expect(inspectEnvironmentFile('file', async () => { throw 'denied'; }))
    .rejects.toThrow('Unable to inspect file: denied');
});
