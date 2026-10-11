import { normalizeInjectedPackageJson } from "../../../src/combine/test-specs/normalize-injected-package-json.mjs";

test.each(["{}", { data: "{}", truncated: false }])(
  "normalizes valid injected package content",
  (input) => {
    expect(normalizeInjectedPackageJson(input)).toEqual({ kind: "available", contents: "{}" });
  },
);

test.each([null, { data: "{}" }])("rejects invalid bounded reader results", (input) => {
  expect(normalizeInjectedPackageJson(input)).toEqual({
    kind: "unavailable",
    reason: "package.json reader returned invalid bounded content",
  });
});

test("rejects truncated and oversized injected package content", () => {
  expect(normalizeInjectedPackageJson({ data: "{}", truncated: true })).toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
  expect(normalizeInjectedPackageJson("x".repeat(100_001))).toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
});

test("decodes valid UTF-8 bytes and rejects invalid UTF-8 bytes", () => {
  expect(normalizeInjectedPackageJson({ data: Buffer.from("{}"), truncated: false })).toEqual({
    kind: "available",
    contents: "{}",
  });
  expect(() =>
    normalizeInjectedPackageJson({ data: Buffer.from([0xff]), truncated: false }),
  ).toThrow();
});

test("rejects injected content without readable text", () => {
  expect(normalizeInjectedPackageJson({ data: 1, truncated: false })).toEqual({
    kind: "unavailable",
    reason: "package.json exceeds the 100000-byte read limit",
  });
});
