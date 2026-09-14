import { loadReviewEnvironment } from '../../src/review/environment.mjs';
import { defaultEnvFile } from '../../src/review/config.mjs';

const base = {
  envFile: 'custom.env',
  readFile: async () => 'OPENAI_API_TOKEN=token',
  readEnvFile: async () => 'OPENAI_API_TOKEN=token',
  inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
};

test('loads environment values from the configured file', async () => {
  await expect(loadReviewEnvironment(base)).resolves.toMatchObject({ OPENAI_API_TOKEN: 'token' });
});

test('retains process environment credentials when an injected environment is empty', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = 'process-token';
  try {
    await expect(loadReviewEnvironment({ ...base, environment: {} })).resolves.toMatchObject({
      OPENAI_API_TOKEN: 'process-token',
    });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('uses readFile when readEnvFile is omitted', async () => {
  const readFile = async () => 'OPENAI_API_TOKEN=token';
  await expect(loadReviewEnvironment({ ...base, readFile, readEnvFile: undefined })).resolves.toMatchObject({
    OPENAI_API_TOKEN: 'token',
  });
});

test('preserves missing environment files', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      readEnvFile: async () => {
        throw { code: 'ENOENT' };
      },
      inspectFile: async () => {
        throw { code: 'ENOENT' };
      },
    }),
  ).resolves.toBeDefined();
});

test('rejects a symbolic default environment file', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      envFile: defaultEnvFile(),
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow('symbolic link');
});

test('wraps environment inspection and read failures with context', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      inspectFile: async () => {
        throw 'stat';
      },
    }),
  ).rejects.toThrow(/Unable to inspect/);
  await expect(
    loadReviewEnvironment({
      ...base,
      readEnvFile: async () => {
        throw Object.assign(new Error('read'), { code: 'EIO' });
      },
    }),
  ).rejects.toThrow(/Unable to read/);
  await expect(
    loadReviewEnvironment({
      ...base,
      readEnvFile: async () => {
        throw 'read';
      },
    }),
  ).rejects.toThrow(/Unable to read/);
});

test('checks custom files for symbolic links', async () => {
  let inspected = false;
  const environment = await loadReviewEnvironment({
    ...base,
    readEnvFile: async () => 'OPENAI_API_TOKEN=custom',
    inspectFile: async () => {
      inspected = true;
      return { dev: 1, ino: 2, isSymbolicLink: () => false };
    },
    environment: {},
  });
  expect(environment.OPENAI_API_TOKEN).toBe('custom');
  expect(inspected).toBe(true);
});

test('rejects a symbolic custom environment file', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
      inspectFile: async () => ({ isSymbolicLink: () => true }),
    }),
  ).rejects.toThrow(/symbolic link/);
});
