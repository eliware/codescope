import path from "node:path";
import { readDirectoryEntries } from "../../src/find/read-entries.mjs";

test("reads, validates, and sorts directory entries", async () => {
  const entries = await readDirectoryEntries(
    async () => [{ name: "b" }, { name: "a" }],
    "repo",
    "repo",
    path,
  );
  expect(entries.map(({ name }) => name)).toEqual(["a", "b"]);
});

test("wraps directory read failures and rejects invalid results", async () => {
  await expect(
    readDirectoryEntries(
      async () => {
        throw new Error("denied");
      },
      "repo/sub",
      "repo",
      path,
    ),
  ).rejects.toThrow("Unable to scan sub: denied");
  await expect(readDirectoryEntries(async () => null, "repo", "repo", path)).rejects.toThrow(
    "non-array",
  );
  await expect(
    readDirectoryEntries(async () => [{ name: "../escape" }], "repo", "repo", path),
  ).rejects.toThrow("Invalid directory entry name");
});

test("reports thrown non-Error values and malformed entry names", async () => {
  await expect(
    readDirectoryEntries(
      async () => {
        throw "denied";
      },
      "repo",
      "repo",
      path,
    ),
  ).rejects.toThrow("Unable to scan .: denied");

  for (const name of ["", ".", "..", "a/b", "a\\b"])
    await expect(
      readDirectoryEntries(async () => [{ name }], "repo", "repo", path),
    ).rejects.toThrow("Invalid directory entry name");
});
