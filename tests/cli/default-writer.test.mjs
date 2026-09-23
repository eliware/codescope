import { EventEmitter } from 'node:events';
import { createDefaultWriter } from '../../src/cli/default-writer.mjs';

test('resolves with the number of written characters', async () => {
  const writes = [];
  const stdout = new EventEmitter();
  stdout.write = (value, callback) => {
    writes.push(value);
    callback();
    return true;
  };
  const result = await createDefaultWriter(stdout)('provider response');
  expect(writes).toEqual(['provider response']);
  expect(result).toEqual({ written: 17 });
});

test('rejects when the output stream reports an error', async () => {
  const stdout = new EventEmitter();
  stdout.write = (_value, callback) => {
    callback(new Error('stream failed'));
    throw new Error('write threw after the callback');
  };
  await expect(createDefaultWriter(stdout)('provider response')).rejects.toThrow('stream failed');
});

test('waits for drain after a backpressured write callback completes', async () => {
  const stdout = new EventEmitter();
  let callback;
  stdout.write = (_value, done) => {
    callback = done;
    return false;
  };
  const pending = createDefaultWriter(stdout)('provider response');
  callback();
  let settled = false;
  pending.then(() => { settled = true; });
  await Promise.resolve();
  expect(settled).toBe(false);
  stdout.emit('drain');
  await expect(pending).resolves.toEqual({ written: 17 });
});

test('rejects stream errors while waiting for backpressure to drain', async () => {
  const stdout = new EventEmitter();
  let callback;
  stdout.write = (_value, done) => {
    callback = done;
    return false;
  };
  const pending = createDefaultWriter(stdout)('provider response');
  callback();
  stdout.emit('error', new Error('drain failed'));
  await expect(pending).rejects.toThrow('drain failed');
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
