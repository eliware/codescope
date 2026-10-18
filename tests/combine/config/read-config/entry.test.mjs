import { readConfigEntry } from "../../../../src/combine/config/read-config/entry.mjs";

test("coordinates injected configuration content and its evidence section", async () => {
  await expect(
    readConfigEntry("repo", ".github/ci.yml", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      readFileContents: async () => "name: workflow",
      platform: "posix",
    }),
  ).resolves.toContain("1 name: workflow");
});

test("omits binary samples from configuration evidence", async () => {
  await expect(
    readConfigEntry("repo", ".github/ci.yml", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      readFileContents: async () => Buffer.from([0, 1]),
      platform: "posix",
    }),
  ).resolves.toBe("");
});

test("reads the package file with default options", async () => {
  await expect(readConfigEntry(process.cwd(), "package.json")).resolves.toContain(
    "===== package.json =====",
  );
});
