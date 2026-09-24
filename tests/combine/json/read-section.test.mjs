import { createJsonSectionReader } from "../../../src/combine/json/read-section.mjs";

test("reads and formats a selected JSON file with host path rules", async () => {
  const reader = createJsonSectionReader("C:\\repo", {
    platform: "win32",
    readFileContents: async (filePath) => {
      expect(filePath).toBe("C:\\repo\\specs\\record.json");
      return '{"ok":true}';
    },
    inspectFile: async () => ({ isFile: () => true, isSymbolicLink: () => false }),
    validateSymlinks: true,
    maxChars: Number.POSITIVE_INFINITY,
  });

  await expect(reader("specs/record.json")).resolves.toBe(
    '===== specs/record.json =====\n1 {"ok":true}\n',
  );
});

test("enforces the per-file character limit after reading", async () => {
  const reader = createJsonSectionReader("/repo", {
    readFileContents: async () => "12345",
    maxChars: 4,
  });

  await expect(reader("record.json")).rejects.toThrow(/character limit/);
});
