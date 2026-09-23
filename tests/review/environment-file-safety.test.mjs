import { assertNotSymbolicLink, assertRegularFile, fileIdentity } from '../../src/review/environment-file-safety.mjs';

test('validates regular file metadata and normalizes identity', () => {
  const metadata = { dev: 1n, ino: 2n, isSymbolicLink: () => false, isFile: () => true };
  expect(() => assertNotSymbolicLink('.env', metadata)).not.toThrow();
  expect(() => assertRegularFile('.env', metadata)).not.toThrow();
  expect(fileIdentity('.env', metadata)).toBe('1:2');
});

test('normalizes safe numeric and bigint identity components equally', () => {
  expect(fileIdentity('file', { dev: 1, ino: 2 })).toBe(fileIdentity('file', { dev: 1n, ino: 2n }));
});

test('keeps unsafe numeric identity values explicitly typed', () => {
  expect(fileIdentity('file', { dev: Number.MAX_SAFE_INTEGER + 2, ino: 2 })).toContain('number:');
});

test('rejects missing and unsafe symbolic-link metadata', () => {
  expect(() => assertNotSymbolicLink('.env', {})).toThrow(/symbolic-link metadata/);
  expect(() => assertNotSymbolicLink('.env', { isSymbolicLink: () => true })).toThrow(/symbolic link/);
  expect(() => assertRegularFile('.env', {})).toThrow(/regular-file metadata/);
  expect(() => assertRegularFile('.env', { isFile: () => false })).toThrow(/regular file/);
});

test('rejects missing or invalid file identity', () => {
  expect(() => fileIdentity('file')).toThrow(/stable file identity/);
  expect(() => fileIdentity('file', {})).toThrow(/stable file identity/);
  expect(() => fileIdentity('file', { dev: 1, ino: '2' })).toThrow(/stable file identity/);
});
