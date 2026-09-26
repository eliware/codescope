import { formatConfigSection } from "../../../src/combine/config/format-config-section.mjs";

test("numbers lines in a configuration section", () => {
  expect(
    formatConfigSection(".github/ci.yml", { text: "first\nsecond", byteTruncated: false }),
  ).toBe("===== .github/ci.yml =====\n1 first\n2 second\n");
});

test("does not count a final newline as an extra line", () => {
  const text = `${Array.from({ length: 200 }, (_, index) => `line-${index}`).join("\n")}\n`;
  const result = formatConfigSection("ci.yml", { text, byteTruncated: false });
  expect(result).toContain("200 line-199");
  expect(result).not.toContain("truncated");
});

test("reports line truncation at the configured boundary", () => {
  const text = Array.from({ length: 201 }, (_, index) => `line-${index}`).join("\n");
  expect(formatConfigSection("ci.yml", { text, byteTruncated: false })).toContain(
    "truncated after 200 lines",
  );
});

test("reports byte truncation and prefers the line marker when both limits apply", () => {
  expect(formatConfigSection("ci.yml", { text: "first", byteTruncated: true })).toContain(
    "truncated after the per-file byte limit",
  );
  const text = Array.from({ length: 201 }, (_, index) => `line-${index}`).join("\n");
  const result = formatConfigSection("ci.yml", { text, byteTruncated: true });
  expect(result).toContain("truncated after 200 lines");
  expect(result).not.toContain("per-file byte limit");
});
