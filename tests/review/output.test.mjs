import { writeFallbackResult, writeProviderResult } from '../../src/review/output.mjs';

test('writes raw string output unchanged', async () => {
  let output = '';
  await writeProviderResult(
    (value) => {
      output = value;
    },
    '{"ok":true}',
  );
  expect(output).toBe('{"ok":true}');
});

test('returns no fallback error when writing succeeds', async () => {
  await expect(writeFallbackResult(() => undefined, { ok: true })).resolves.toBeUndefined();
  await expect(writeFallbackResult(() => undefined, '{"ok":true}')).resolves.toBeUndefined();
});

test('adds output context to writer failures', async () => {
  await expect(
    writeProviderResult(
      () => {
        throw new Error('disk full');
      },
      {},
      'custom',
    ),
  ).rejects.toThrow('Unable to write custom output: disk full');
});

test('returns fallback writer failures without replacing the original failure', async () => {
  await expect(
    writeFallbackResult(
      () => {
        throw new Error('disk full');
      },
      { error: 'provider' },
    ),
  ).resolves.toMatchObject({ message: 'disk full' });
});

test('returns fallback short-write failures', async () => {
  await expect(
    writeFallbackResult(async (value) => ({ written: value.length - 1 }), 'hello'),
  ).resolves.toMatchObject({ message: 'Writer reported a short write: 4 of 5 characters' });
});

test('formats non-error writer failures', async () => {
  await expect(
    writeProviderResult(
      () => {
        throw 'disk full';
      },
      {},
      'custom',
    ),
  ).rejects.toThrow(/disk full/);
});

test('rejects a numeric short write', async () => {
  await expect(
    writeProviderResult(async (value) => ({ written: value.length - 1 }), 'hello'),
  ).rejects.toThrow('short write: 4 of 5 characters');
});

test('accepts a numeric complete write', async () => {
  await expect(
    writeProviderResult(async (value) => ({ written: value.length }), 'hello'),
  ).resolves.toBeUndefined();
});

test('accepts boolean stream status results', async () => {
  await expect(writeProviderResult(async () => true, 'hello')).resolves.toBeUndefined();
  await expect(writeProviderResult(async () => false, 'hello')).resolves.toBeUndefined();
});

test('rejects unsupported writer results', async () => {
  for (const result of [0, 'written', null, {}])
    await expect(writeProviderResult(async () => result, 'hello')).rejects.toThrow(
      'unsupported result',
    );
});

test('rejects an invalid explicit write count', async () => {
  await expect(writeProviderResult(async () => ({ written: '5' }), 'hello')).rejects.toThrow(
    'invalid written character count',
  );
});
