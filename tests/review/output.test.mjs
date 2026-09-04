import { writeFallbackResult, writeJsonResult } from '../../src/review/output.mjs';

test('writes indented JSON with a trailing newline', async () => {
  let output = '';
  await writeJsonResult(
    (value) => {
      output = value;
    },
    { ok: true },
  );
  expect(output).toBe('{\n  "ok": true\n}\n');
});

test('adds output context to writer failures', async () => {
  await expect(
    writeJsonResult(
      () => {
        throw new Error('disk full');
      },
      {},
      'custom',
    ),
  ).rejects.toThrow('Unable to write custom output: disk full');
});

test('does not replace a provider failure when fallback writing fails', async () => {
  await expect(
    writeFallbackResult(
      () => {
        throw new Error('disk full');
      },
      { error: 'provider' },
    ),
  ).resolves.toBeUndefined();
});
