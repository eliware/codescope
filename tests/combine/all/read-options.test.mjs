import { createAllReadOptions } from "../../../src/combine/all/read-options.mjs";

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

test("caches calls to the configured reader", async () => {
  const reads = [];
  const readFileContents = async () => "content";
  const options = createAllReadOptions({
    readFileContents: async (file) => {
      reads.push(file);
      return readFileContents();
    },
  });
  await options.readFileContents("file");
  await options.readFileContents("file");
  expect(reads).toEqual(["file"]);
});

test("keeps the default file reader unchanged", () => {
  const defaultReader = async () => "content";
  const options = { readFileContents: defaultReader };
  expect(createAllReadOptions(options, defaultReader)).toBe(options);
});
