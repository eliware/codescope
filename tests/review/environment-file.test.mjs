import { readReviewEnvironmentFile } from '../../src/review/environment-file.mjs';
import { defaultEnvFile } from '../../src/review/env-file-path.mjs';

test('reads a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      readFile: () => {},
      readEnvFile: async () => 'x',
      inspectFile: async () => ({ isSymbolicLink: () => false }),
    }),
  ).resolves.toBe('x');
});

test('wraps errors reading a supplied environment file', async () => {
  await expect(
    readReviewEnvironmentFile({
      envFile: 'file',
      readEnvFile: async () => { throw new Error('read failed'); },
      inspectFile: async () => ({ isSymbolicLink: () => false }),
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

test('rechecks a file that appears after the initial missing inspection', async () => {
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
  expect(inspections).toBe(2);
});

test('rejects a file that appears as a symbolic link after the initial miss', async () => {
  const missing = Object.assign(new Error('missing'), { code: 'ENOENT' });
  let inspections = 0;
  await expect(
    readReviewEnvironmentFile({
      envFile: defaultEnvFile(),
      inspectFile: async () => {
        inspections += 1;
        if (inspections === 1) throw missing;
        return { isSymbolicLink: () => true };
      },
      readEnvFile: async () => 'OPENAI_API_TOKEN=value',
    }),
  ).rejects.toThrow(/symbolic link/);
});
