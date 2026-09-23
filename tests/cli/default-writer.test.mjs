import { createDefaultWriter } from '../../src/cli/default-writer.mjs';

test('resolves with the number of written characters', async () => {
  const writes = [];
  const result = await createDefaultWriter({
    write(value, callback) {
      writes.push(value);
      callback();
    },
  })('provider response');
  expect(writes).toEqual(['provider response']);
  expect(result).toEqual({ written: 17 });
});

test('rejects when the output stream reports an error', async () => {
  await expect(createDefaultWriter({
    write(_value, callback) {
      callback(new Error('stream failed'));
    },
  })('provider response')).rejects.toThrow('stream failed');
});

test('uses process stdout when no stream is supplied', async () => {
  const originalWrite = process.stdout.write;
  process.stdout.write = (_value, callback) => { callback(); return true; };
  try {
    await expect(createDefaultWriter()('text')).resolves.toEqual({ written: 4 });
  } finally {
    process.stdout.write = originalWrite;
  }
});
