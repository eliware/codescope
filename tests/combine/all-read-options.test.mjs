import { createAllReadOptions } from "../../src/combine/all-read-options.mjs";
import { readFile } from "node:fs/promises";

test("creates shared all-context read options", async () => {
  const reads = [];
  const options = createAllReadOptions({
    readFileContents: async (file) => {
      reads.push(file);
      return "content";
    },
  });
  await expect(options.readFileContents("file")).resolves.toBe("content");
  await expect(options.readFileContents("file")).resolves.toBe("content");
  expect(reads).toEqual(["file"]);
});

test("preserves the verified filesystem reader instead of wrapping it in a path reader", () => {
  const options = createAllReadOptions({ readFileContents: readFile });
  expect(options.readFileContents).toBe(readFile);
});
