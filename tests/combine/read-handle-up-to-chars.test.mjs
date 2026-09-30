import { readHandleUpToChars } from "../../src/combine/read-handle-up-to-chars.mjs";

test("reads only the character budget and a bounded overflow sample", async () => {
  const source = Buffer.from(`${"a".repeat(10_000)} tail`);
  let offset = 0;
  const handle = {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, source.length - offset);
      source.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
  };

  await expect(readHandleUpToChars(handle, 12)).resolves.toBe("a".repeat(13));
  expect(offset).toBe(13);
});

test("does not split UTF-8 sequences while sampling an overflow character", async () => {
  const source = Buffer.from("a😀z");
  let offset = 0;
  const handle = {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, source.length - offset);
      source.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
  };

  await expect(readHandleUpToChars(handle, 1)).resolves.toBe("a😀");
  expect(offset).toBe(5);
});

test("flushes the decoder when the complete file fits within the limit", async () => {
  const source = Buffer.from("whole file");
  let offset = 0;
  const handle = {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, source.length - offset);
      source.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
  };

  await expect(readHandleUpToChars(handle, 20)).resolves.toBe("whole file");
  expect(offset).toBe(source.length);
});
