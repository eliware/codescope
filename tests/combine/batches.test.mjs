import { readBatches } from "../../src/combine/batches.mjs";

test("reads bounded batches and accounts for total size", async () => {
  const result = await readBatches(["a", "b", "c"], {
    batchSize: 2,
    maxChars: 10,
    read: async (value) => value,
  });
  expect(result).toEqual(["a", "b", "c"]);
});

test("rejects a batch that exceeds the aggregate limit", async () => {
  await expect(
    readBatches(["long"], {
      batchSize: 1,
      maxChars: 2,
      read: async () => "long",
    }),
  ).rejects.toThrow(/limit/);
});

test("rejects invalid batch sizes before starting reads", async () => {
  await expect(
    readBatches(["a"], { batchSize: 0, maxChars: 10, read: async () => "a" }),
  ).rejects.toThrow(/positive integer/);
});

test("preserves source order while workers complete out of order", async () => {
  const result = await readBatches(["slow", "fast"], {
    batchSize: 2,
    maxChars: 100,
    read: (value) =>
      new Promise((resolve) => {
        setTimeout(() => resolve(value), value === "slow" ? 10 : 0);
      }),
  });
  expect(result).toEqual(["slow", "fast"]);
});

test("rejects promptly when a failed read races with a stalled read", async () => {
  const stalledRead = new Promise(() => {});
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("batch failure was delayed")), 100);
  });

  try {
    await expect(
      Promise.race([
        readBatches(["failed", "stalled"], {
          batchSize: 2,
          maxChars: 100,
          read: (file) =>
            file === "failed" ? Promise.reject(new Error("read failed")) : stalledRead,
        }),
        timeout,
      ]),
    ).rejects.toThrow("read failed");
  } finally {
    clearTimeout(timeoutId);
  }
});
