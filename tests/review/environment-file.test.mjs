import { readReviewEnvironmentFile } from '../../src/review/environment-file.mjs';
import { defaultEnvFile } from '../../src/review/env-file-path.mjs';

const openWith = (text = 'OPENAI_API_TOKEN=value') => async () => ({
  stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
  readFile: async () => text,
  close: async () => {},
});

test('reads a supplied environment file through the stable reader boundary', async () => {
  await expect(readReviewEnvironmentFile({
    envFile: 'file',
    inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    openEnvFile: openWith('OPENAI_API_TOKEN=value'),
  })).resolves.toBe('OPENAI_API_TOKEN=value');
});

test('wraps failures opening a supplied environment file', async () => {
  await expect(readReviewEnvironmentFile({
    envFile: 'file',
    inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    openEnvFile: async () => { throw new Error('read failed'); },
  })).rejects.toThrow('Unable to securely read file: read failed');
});

test('preserves an optional default file that is absent at startup', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  await expect(readReviewEnvironmentFile({
    envFile: defaultEnvFile(),
    inspectFile: async () => { throw missing; },
  })).resolves.toBe('');
});

test('does not reopen a default file that appears after startup inspection', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  let opened = false;
  await expect(readReviewEnvironmentFile({
    envFile: defaultEnvFile(),
    inspectFile: async () => { throw missing; },
    openEnvFile: async () => { opened = true; return openWith()(); },
  })).resolves.toBe('');
  expect(opened).toBe(false);
});

test('requires inspection and stable-reader collaborators for existing files', async () => {
  await expect(readReviewEnvironmentFile({ envFile: 'file', inspectFile: async () => ({}) }))
    .rejects.toThrow(/symbolic-link metadata/);
  await expect(readReviewEnvironmentFile({
    envFile: 'file',
    inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  })).rejects.toThrow(/stable environment-file opener/);
});
