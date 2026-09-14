import { readReviewEnvironmentFile } from '../../src/review/environment-file.mjs';
import { fileIdentity } from '../../src/review/environment-file-safety.mjs';
import { defaultEnvFile } from '../../src/review/env-file-path.mjs';

test('reads a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      readFile: () => {},
      readEnvFile: async () => 'x',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    }),
  ).resolves.toBe('x');
});

test('wraps errors reading a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      readEnvFile: async () => { throw new Error('read failed'); },
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    }),
  ).rejects.toThrow('Unable to read file: read failed');
});

test('rejects incomplete file inspection metadata', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({}),
      readEnvFile: async () => 'OPENAI_API_TOKEN=value',
    }),
  ).rejects.toThrow(/symbolic-link metadata/);
});

test('rejects a file that disappears after it was inspected', async () => {
  const missing = Object.assign(new Error('gone'), { code: 'ENOENT' });
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      readEnvFile: async () => { throw missing; },
    }),
  ).rejects.toThrow(/Unable to read/);
});

test('preserves a default file that is absent before reading', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => { throw missing; },
      readEnvFile: async () => { throw missing; },
    }),
  ).resolves.toBe('');
});

test('does not recheck a file that appears after the initial missing inspection', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  let inspections = 0;
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => {
        inspections += 1;
        if (inspections === 1) throw missing;
        return { isSymbolicLink: () => false };
      },
      readEnvFile: async () => 'OPENAI_API_TOKEN=value',
    }),
  ).resolves.toBe('OPENAI_API_TOKEN=value');
  expect(inspections).toBe(1);
});

test('rejects replacement of an existing file between inspection and read', async () => {
  let inspections = 0;
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => {
        inspections += 1;
        return { dev: 1, ino: inspections === 1 ? 2 : 3, isSymbolicLink: () => false };
      },
      readEnvFile: async () => 'OPENAI_API_TOKEN=value',
    }),
  ).rejects.toThrow(/replaced/);
});

test('accepts a stable existing file with bigint identity metadata', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({
        dev: 1n,
        ino: 2n,
        isSymbolicLink: () => false,
      }),
      readEnvFile: async () => 'OPENAI_API_TOKEN=value',
    }),
  ).resolves.toBe('OPENAI_API_TOKEN=value');
});

test('rejects an existing file without stable identity metadata', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      readEnvFile: async () => 'OPENAI_API_TOKEN=value',
    }),
  ).rejects.toThrow(/stable file identity/);
});

test('reads an existing file through one stable opened handle', async () => {
  let closed = false;
  const metadata = { dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true };
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => metadata,
      readEnvFile: async () => { throw new Error('path read was not allowed'); },
      openEnvFile: async () => ({
        stat: async () => metadata,
        readFile: async () => 'OPENAI_API_TOKEN=stable',
        close: async () => { closed = true; throw new Error('close failed'); },
      }),
    }),
  ).resolves.toBe('OPENAI_API_TOKEN=stable');
  expect(closed).toBe(true);
});

test('rejects an opened handle whose identity differs from the initial inspection', async () => {
  let closed = false;
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 3, isSymbolicLink: () => false, isFile: () => true }),
        readFile: async () => 'unused',
        close: async () => { closed = true; },
      }),
    }),
  ).rejects.toThrow(/replaced while it was being opened/);
  expect(closed).toBe(true);
});

test('rejects an opened handle that is not a regular file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => false }),
        readFile: async () => 'unused',
        close: async () => {},
      }),
    }),
  ).rejects.toThrow(/regular file/);
});

test('rejects an opened handle without regular-file metadata', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
        readFile: async () => 'unused',
        close: async () => {},
      }),
    }),
  ).rejects.toThrow(/regular-file metadata/);
});

test('rejects absent identity metadata directly', () => {
  expect(() => fileIdentity('file', undefined)).toThrow(/stable file identity/);
});
