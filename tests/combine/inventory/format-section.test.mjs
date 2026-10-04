import { formatInventorySection } from "../../../src/combine/inventory/format-section.mjs";

test("fits sorted inventory records to the remaining character budget", () => {
  const entries = ["a".repeat(50), "b".repeat(50)];
  const result = formatInventorySection(entries, 146);

  expect(result.length).toBeLessThanOrEqual(146);
  expect(result).toContain(`\n${"a".repeat(50)}\n`);
  expect(result).toContain("inventory truncated: 1 entries omitted");
  expect(result).not.toContain("b".repeat(50));
});

test("returns the complete inventory when it fits", () => {
  const entries = ["a.txt | text | 1 lines | 1 bytes"];
  expect(formatInventorySection(entries)).toBe(
    "===== other files (names and sizes only) =====\na.txt | text | 1 lines | 1 bytes\n",
  );
});

test("returns finite-budget inventory unchanged when all entries fit", () => {
  const entries = ["a.txt | text | 1 lines | 1 bytes"];
  const complete = formatInventorySection(entries);
  expect(formatInventorySection(entries, complete.length)).toBe(complete);
});

test("omits the section when even its heading and truncation note exceed the budget", () => {
  expect(formatInventorySection(["a"], 10)).toBe("");
});
