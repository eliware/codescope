import { readReviewEnvironmentFile } from '../../src/review/environment-file.mjs';
import { fileIdentity } from '../../src/review/environment-file-safety.mjs';
import { defaultEnvFile } from '../../src/review/env-file-path.mjs';

const openWith = (text = 'OPENAI_API_TOKEN=value', metadata = { dev: 1, ino: 2 }) => async () => ({
  stat: async () => ({ ...metadata, isSymbolicLink: () => false, isFile: () => true }),
  readFile: async () => text,
  close: async () => {},
});

test('reads a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      readFile: () => {},
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile: openWith('x'),
    }),
  ).resolves.toBe('x');
});

test('wraps errors reading a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      openEnvFile: async () => { throw new Error('read failed'); },
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    }),
  ).rejects.toThrow('Unable to securely read file: read failed');
});

test('rejects incomplete file inspection metadata', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({}),
    }),
  ).rejects.toThrow(/symbolic-link metadata/);
});

test('rejects a file that disappears after it was inspected', async () => {
  const missing = Object.assign(new Error('gone'), { code: 'ENOENT' });
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => ({ isSymbolicLink: () => false }),
      openEnvFile: async () => { throw missing; },
    }),
  ).rejects.toThrow(/Unable to inspect/);
});

test('requires a stable opener for an existing file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
    }),
  ).rejects.toThrow(/stable environment-file opener/);
});

test('preserves a default file that is absent before reading', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => { throw missing; },
    }),
  ).resolves.toBe('');
});

test('does not hide an inaccessible environment-file parent', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  const denied = Object.assign(new Error('denied'), { code: 'EACCES' });
  let inspections = 0;
  await expect(
    readReviewEnvironmentFile({
      envFile: 'C:/private/.env',
      inspectFile: async () => {
        inspections += 1;
        if (inspections === 1) throw missing;
        throw denied;
      },
    }),
  ).rejects.toThrow(/Unable to inspect/);
});

test('does not treat a non-directory environment parent as absent', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  let inspections = 0;
  await expect(
    readReviewEnvironmentFile({
      envFile: 'C:/private/.env',
      inspectFile: async () => {
        inspections += 1;
        if (inspections === 1) throw missing;
        return { isDirectory: () => false };
      },
    }),
  ).rejects.toThrow(/Unable to inspect/);
});

test('does not open a file that appears after the initial missing inspection', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  let inspections = 0;
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => {
        inspections += 1;
        if (inspections === 1) throw missing;
        return { isDirectory: () => true };
      },
      openEnvFile: openWith(),
    }),
  ).resolves.toBe('');
  expect(inspections).toBe(2);
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
       openEnvFile: async () => ({
         stat: async () => ({ dev: 1, ino: 3, isSymbolicLink: () => false, isFile: () => true }),
         readFile: async () => 'unused',
         close: async () => {},
       }),
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
       openEnvFile: openWith('OPENAI_API_TOKEN=value', { dev: 1, ino: 2 }),
    }),
  ).resolves.toBe('OPENAI_API_TOKEN=value');
});

test('normalizes safe numeric and bigint identity components equally', () => {
  expect(fileIdentity('file', { dev: 1, ino: 2 })).toBe(fileIdentity('file', { dev: 1n, ino: 2n }));
});

test('keeps unsafe numeric identity values explicitly typed', () => {
  expect(fileIdentity('file', { dev: Number.MAX_SAFE_INTEGER + 2, ino: 2 })).toContain('number:');
});

test('rejects an existing file without stable identity metadata', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
    }),
  ).rejects.toThrow(/stable file identity/);
});

test('rejects a handle that fails during cleanup', async () => {
  let closed = false;
  const metadata = { dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true };
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => metadata,
      openEnvFile: async () => ({
        stat: async () => metadata,
        readFile: async () => 'OPENAI_API_TOKEN=stable',
        close: async () => { closed = true; throw new Error('close failed'); },
      }),
    }),
  ).rejects.toThrow(/Unable to close securely/);
  expect(closed).toBe(true);
});

test('preserves cleanup failure metadata when reading already failed', async () => {
  const error = new Error('read failed');
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
      openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
        readFile: async () => { throw error; },
        close: async () => { throw new Error('close failed'); },
      }),
    }),
  ).rejects.toMatchObject({ cause: error, closeError: { message: 'close failed' } });
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
