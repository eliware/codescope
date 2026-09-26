import { formatInventoryEntry } from "../../../src/combine/inventory/format-entry.mjs";

test("formats complete inventory metadata", () => {
  expect(formatInventoryEntry("notes.txt", { bytes: Buffer.from("hello"), truncated: false })).toBe(
    "notes.txt | text | 1 lines | 5 bytes",
  );
});

test("marks truncated samples as omitted metadata", () => {
  expect(
    formatInventoryEntry("large.txt", {
      bytes: Buffer.alloc(100_001),
      truncated: true,
    }),
  ).toBe("large.txt | omitted | at least 100001 sampled bytes | per-file metadata limit reached");
});
