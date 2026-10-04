import { EventEmitter } from "node:events";
import { createDefaultWriter } from "../../src/cli/default-writer.mjs";

test("resolves with the number of written characters", async () => {
  const writes = [];
  const stdout = new EventEmitter();
  stdout.write = (value, callback) => {
    writes.push(value);
    callback();
    return true;
  };
  const result = await createDefaultWriter(stdout)("provider response");
  expect(writes).toEqual(["provider response"]);
  expect(result).toEqual({ written: 17 });
});

test("prioritizes a synchronous write exception over a callback error", async () => {
  const stdout = new EventEmitter();
  stdout.write = (_value, callback) => {
    callback(new Error("stream failed"));
    throw new Error("write threw after the callback");
  };
  await expect(createDefaultWriter(stdout)("provider response")).rejects.toThrow(
    "write threw after the callback",
  );
});

test("keeps the first stream failure when write throws after an emitted error", async () => {
  const stdout = new EventEmitter();
  const streamError = new Error("stream failed");
  stdout.write = () => {
    stdout.emit("error", streamError);
    throw new Error("write also failed");
  };

  await expect(createDefaultWriter(stdout)("response")).rejects.toBe(streamError);
});

test("rejects when the callback reports an error", async () => {
  const stdout = new EventEmitter();
  stdout.write = (_value, callback) => {
    callback(new Error("stream failed"));
    return true;
  };
  await expect(createDefaultWriter(stdout)("provider response")).rejects.toThrow("stream failed");
});

test("waits for drain after a backpressured write callback completes", async () => {
  const stdout = new EventEmitter();
  let callback;
  stdout.write = (_value, done) => {
    callback = done;
    return false;
  };
  const pending = createDefaultWriter(stdout)("provider response");
  callback();
  let settled = false;
  pending.then(() => {
    settled = true;
  });
  await Promise.resolve();
  expect(settled).toBe(false);
  stdout.emit("drain");
  await expect(pending).resolves.toEqual({ written: 17 });
});

test("completes when drain fires synchronously during a backpressured write", async () => {
  const stdout = new EventEmitter();
  stdout.write = (_value, callback) => {
    stdout.emit("drain");
    callback();
    return false;
  };

  await expect(createDefaultWriter(stdout)("provider response")).resolves.toEqual({ written: 17 });
});

test("rejects stream errors while waiting for backpressure to drain", async () => {
  const stdout = new EventEmitter();
  let callback;
  stdout.write = (_value, done) => {
    callback = done;
    return false;
  };
  const pending = createDefaultWriter(stdout)("provider response");
  callback();
  stdout.emit("error", new Error("drain failed"));
  await expect(pending).rejects.toThrow("drain failed");
});

test("keeps an error rejection settled when the write callback arrives later", async () => {
  const stdout = new EventEmitter();
  let callback;
  stdout.write = (_value, done) => {
    callback = done;
    return true;
  };
  const pending = createDefaultWriter(stdout)("provider response");
  const error = new Error("stream failed before callback");
  stdout.emit("error", error);
  callback();
  await expect(pending).rejects.toBe(error);
});

test("handles late stdout errors without poisoning later writes", async () => {
  const stdout = new EventEmitter();
  const writes = [];
  stdout.write = (value, callback) => {
    writes.push(value);
    callback();
    return true;
  };
  const write = createDefaultWriter(stdout);
  await expect(write("first")).resolves.toEqual({ written: 5 });
  const error = new Error("late stream failure");
  expect(() => stdout.emit("error", error)).not.toThrow();
  await expect(write("second")).resolves.toEqual({ written: 6 });
  expect(writes).toEqual(["first", "second"]);
});

test("reuses one writer and stdout error listener for the same stream", () => {
  const stdout = new EventEmitter();
  expect(createDefaultWriter(stdout)).toBe(createDefaultWriter(stdout));
  expect(stdout.listenerCount("error")).toBe(1);
});

test("uses process stdout when no stream is supplied", async () => {
  const originalWrite = process.stdout.write;
  process.stdout.write = (_value, callback) => {
    callback();
    return true;
  };
  try {
    await expect(createDefaultWriter()("text")).resolves.toEqual({ written: 4 });
  } finally {
    process.stdout.write = originalWrite;
  }
});
