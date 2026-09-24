import { readSelectedSections } from "../../../src/combine/selected/read-sections.mjs";

test("reads requested source categories in implementation, test, and docs order", async () => {
  const requests = [];
  const result = await readSelectedSections({
    root: "/repo",
    selection: { implementation: true, tests: true, docs: true },
    options: { concurrency: 4 },
    inventory: ["src/a.mjs", "tests/a.test.mjs", "README.md"],
    budget: { read: async (read) => read(200) },
    combine: async (root, extensions, options) => {
      requests.push({ root, extensions, options });
      return options.testsOnly ? "tests" : options.noTests ? "source" : "docs";
    },
  });

  expect(result).toEqual(["source", "tests", "docs"]);
  expect(requests.map(({ options }) => options.maxChars)).toEqual([200, 200, 200]);
  expect(requests.map(({ options }) => options.files)).toEqual([
    ["src/a.mjs", "tests/a.test.mjs", "README.md"],
    ["src/a.mjs", "tests/a.test.mjs", "README.md"],
    ["src/a.mjs", "tests/a.test.mjs", "README.md"],
  ]);
});

test("does not read categories that were not selected", async () => {
  let readCount = 0;
  let combineCount = 0;
  const read = async () => {
    readCount += 1;
  };
  await expect(
    readSelectedSections({
      root: "/repo",
      selection: { implementation: false, tests: false, docs: false },
      options: {},
      inventory: [],
      budget: { read },
      combine: async () => {
        combineCount += 1;
      },
    }),
  ).resolves.toEqual([]);
  expect(readCount).toBe(0);
  expect(combineCount).toBe(0);
});
