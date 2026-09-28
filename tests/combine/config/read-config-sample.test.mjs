import { readConfigSample } from "../../../src/combine/config/read-config-sample.mjs";

test("normalizes bounded text and byte samples", () => {
  expect(readConfigSample("plain text")).toEqual({
    binary: false,
    byteTruncated: false,
    text: "plain text",
  });
  expect(readConfigSample({ data: Buffer.from("text"), truncated: false }).text).toBe("text");
});

test("omits binary samples", () => {
  expect(readConfigSample(Buffer.from([0, 1]))).toMatchObject({ binary: true, text: "" });
});

test("omits an incomplete UTF-8 character at the byte boundary", () => {
  const bytes = Buffer.concat([Buffer.alloc(99_999, "x"), Buffer.from("€")]);
  const sample = readConfigSample(
    { data: bytes.subarray(0, 100_000), truncated: true },
    { readerProvided: true, relativePath: ".github/ci.yml" },
  );
  expect(sample.text).toBe("x".repeat(99_999));
  expect(sample.text).not.toContain("\uFFFD");
  expect(sample.byteTruncated).toBe(true);
});

test("rejects malformed UTF-8 instead of supplying replacement characters", () => {
  expect(() =>
    readConfigSample(Buffer.from([0x61, 0xc3, 0x28]), { relativePath: ".github/ci.yml" }),
  ).toThrow(/not valid UTF-8/);
});
