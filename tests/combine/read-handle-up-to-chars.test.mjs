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

  await expect(readHandleUpToChars(handle, 12)).resolves.toBe(`${"a".repeat(12)}�`);
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

  await expect(readHandleUpToChars(handle, 1)).resolves.toBe("a�");
  expect(offset).toBe(5);
});

test("preserves a complete supplementary character inside the retained prefix", async () => {
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

  await expect(readHandleUpToChars(handle, 3)).resolves.toBe("a😀�");
});

test("caps repeated supplementary characters at the character limit plus marker", async () => {
  const source = Buffer.from("a😀😀");
  let offset = 0;
  const handle = {
    async read(buffer, start, length) {
      const bytesRead = Math.min(length, source.length - offset);
      source.copy(buffer, start, offset, offset + bytesRead);
      offset += bytesRead;
      return { bytesRead };
    },
  };
  const result = await readHandleUpToChars(handle, 2);
  expect(result.length).toBe(3);
  expect(result).toBe("a��");
  expect(result).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/u);
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

test("preserves replacement output for an incomplete UTF-8 sequence at EOF", async () => {
  const source = Buffer.from([0xc3]);
  let read = false;
  const handle = {
    async read(buffer, start, length) {
      if (read) return { bytesRead: 0 };
      read = true;
      source.copy(buffer, start, 0, Math.min(length, source.length));
      return { bytesRead: source.length };
    },
  };
  await expect(readHandleUpToChars(handle, 1)).resolves.toBe("�");
});
