import { selectFiles } from "../../src/combine/select-files.mjs";

test("filters supplied files by extension and test mode", async () => {
  await expect(
    selectFiles("/repo", ".mjs", {
      files: ["src/app.mjs", "tests/app.test.mjs", "guide.md"],
      noTests: true,
    }),
  ).resolves.toEqual(["src/app.mjs"]);
});

test("selects supported implementation, documentation, and test extensions", async () => {
  await expect(
    selectFiles("/repo", [".js", ".mjs", ".cjs", ".ts"], {
      files: ["a.js", "b.mjs", "c.cjs", "d.ts", "guide.md"],
    }),
  ).resolves.toEqual(["a.js", "b.mjs", "c.cjs", "d.ts"]);
  await expect(selectFiles("/repo", ".md", { files: ["guide.md", "app.mjs"] })).resolves.toEqual([
    "guide.md",
  ]);
});

test("discovers files when no inventory is supplied", async () => {
  await expect(selectFiles("/repo", ".mjs", { readDirectory: async () => [] })).resolves.toEqual(
    [],
  );
});
