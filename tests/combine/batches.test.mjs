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
  let finishSlow;
  let finishFast;
  const slow = new Promise((resolve) => {
    finishSlow = resolve;
  });
  const fast = new Promise((resolve) => {
    finishFast = resolve;
  });
  const result = readBatches(["slow", "fast"], {
    batchSize: 2,
    maxChars: 100,
    read: (value) => (value === "slow" ? slow : fast),
  });
  finishFast("fast");
  finishSlow("slow");
  await expect(result).resolves.toEqual(["slow", "fast"]);
});

test("rejects when one read fails while another read is stalled", async () => {
  let finishStalled;
  let signalStalled;
  const stalledRead = new Promise((resolve) => {
    finishStalled = resolve;
  });
  const stalledStarted = new Promise((resolve) => {
    signalStalled = resolve;
  });
  const result = readBatches(["failed", "stalled"], {
    batchSize: 2,
    maxChars: 100,
    read: async (file) => {
      if (file === "stalled") {
        signalStalled();
        return stalledRead;
      }
      await stalledStarted;
      throw new Error("read failed");
    },
  });
  await expect(result).rejects.toThrow("read failed");
  finishStalled("stalled");
});
