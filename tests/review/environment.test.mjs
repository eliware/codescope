import { loadReviewEnvironment } from '../../src/review/environment.mjs';
import { defaultEnvFile } from '../../src/review/config.mjs';

const base = {
  envFile: 'custom.env',
  readFile: async () => 'OPENAI_API_TOKEN=token',
  inspectFile: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false }),
  openEnvFile: async () => ({
    stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
    readFile: async () => 'OPENAI_API_TOKEN=token',
    close: async () => {},
  }),
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

test('process credentials remain authoritative over injected values', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = 'process-token';
  try {
    await expect(
      loadReviewEnvironment({ ...base, environment: { OPENAI_API_TOKEN: 'injected-token' } }),
    ).resolves.toMatchObject({ OPENAI_API_TOKEN: 'process-token' });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('blank process credentials do not suppress injected values', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = '   ';
  try {
    await expect(
      loadReviewEnvironment({ ...base, environment: { OPENAI_API_TOKEN: 'injected-token' } }),
    ).resolves.toMatchObject({ OPENAI_API_TOKEN: 'injected-token' });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('blank process credentials fall back to the file token', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = '   ';
  try {
    await expect(loadReviewEnvironment({ ...base, environment: {} })).resolves.toMatchObject({
      OPENAI_API_TOKEN: 'token',
    });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('treats a blank process credential as absent when no file token exists', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = '   ';
  try {
    await expect(loadReviewEnvironment({ ...base, readFile: async () => '', openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => '',
      close: async () => {},
    }), environment: {} })).resolves.not.toHaveProperty('OPENAI_API_TOKEN');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('treats an explicitly injected blank credential as absent', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  delete process.env.OPENAI_API_TOKEN;
  try {
    await expect(
      loadReviewEnvironment({ ...base, openEnvFile: async () => ({
        stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
        readFile: async () => '',
        close: async () => {},
      }), environment: { OPENAI_API_TOKEN: '   ' } }),
    ).resolves.not.toHaveProperty('OPENAI_API_TOKEN');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('does not expose unrelated process variables to review configuration', async () => {
  const previous = process.env.CODESCOPE_TEST_SECRET;
  process.env.CODESCOPE_TEST_SECRET = 'unrelated';
  try {
    const environment = await loadReviewEnvironment({ ...base, environment: {} });
    expect(environment).not.toHaveProperty('CODESCOPE_TEST_SECRET');
  } finally {
    if (previous === undefined) delete process.env.CODESCOPE_TEST_SECRET;
    else process.env.CODESCOPE_TEST_SECRET = previous;
  }
});

test('uses the stable opener for configuration text', async () => {
  await expect(loadReviewEnvironment({ ...base })).resolves.toMatchObject({
    OPENAI_API_TOKEN: 'token',
  });
});

test('preserves missing environment files', async () => {
  await expect(
    loadReviewEnvironment({
      ...base,
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
      openEnvFile: async () => { throw Object.assign(new Error('read'), { code: 'EIO' }); },
    }),
  ).rejects.toThrow(/Unable to securely read/);
  await expect(
    loadReviewEnvironment({
      ...base,
      openEnvFile: async () => { throw 'read'; },
    }),
  ).rejects.toThrow(/Unable to securely read/);
});

test('checks custom files for symbolic links', async () => {
  let inspected = false;
  const environment = await loadReviewEnvironment({
    ...base,
    openEnvFile: async () => ({
      stat: async () => ({ dev: 1, ino: 2, isSymbolicLink: () => false, isFile: () => true }),
      readFile: async () => 'OPENAI_API_TOKEN=custom',
      close: async () => {},
    }),
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
