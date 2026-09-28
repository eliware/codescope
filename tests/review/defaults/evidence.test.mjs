import path from "node:path";
import { createEvidenceDefaults } from "../../../src/review/defaults/evidence.mjs";

test("creates evidence defaults", () => {
  expect(createEvidenceDefaults()).toMatchObject({
    combine: expect.any(Function),
    maxSourceChars: 3_000_000,
    inspectFile: expect.any(Function),
  });
});

test("default evidence combiner selects every supported implementation extension", async () => {
  const { combine } = createEvidenceDefaults();
  const readFiles = [];
  const combined = await combine("/repo", {
    files: ["src/app.js", "src/app.cjs", "src/app.mjs", "src/app.ts", "README.md"],
    readFileContents: async (filePath) => {
      readFiles.push(filePath);
      return "source";
    },
  });
  expect(readFiles).toEqual(
    ["src/app.js", "src/app.cjs", "src/app.mjs", "src/app.ts"].map((file) =>
      path.resolve("/repo", file),
    ),
  );
  expect(combined).toContain("===== src/app.ts =====");
});
