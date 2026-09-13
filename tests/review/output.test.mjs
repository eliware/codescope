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
