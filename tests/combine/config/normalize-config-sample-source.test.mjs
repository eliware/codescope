import { normalizeConfigSampleSource } from "../../../src/combine/config/normalize-config-sample-source.mjs";

test("normalizes bounded text and byte results", () => {
  expect(normalizeConfigSampleSource("plain text").bytes.toString()).toBe("plain text");
  expect(
    normalizeConfigSampleSource({ data: Buffer.from("text"), truncated: false }).byteTruncated,
  ).toBe(false);
});

test("rejects malformed reader results and unsupported data", () => {
  expect(() => normalizeConfigSampleSource({ data: "text" })).toThrow(/reader must return/);
  expect(() => normalizeConfigSampleSource(42)).toThrow(/reader data must be text or bytes/);
  expect(() => normalizeConfigSampleSource(null)).toThrow(/reader data must be text or bytes/);
});

test("enforces injected-reader byte boundaries", () => {
  expect(() =>
    normalizeConfigSampleSource(Buffer.alloc(100_001), { readerProvided: true }),
  ).toThrow(/100000-byte/);
  expect(() =>
    normalizeConfigSampleSource(
      { data: Buffer.alloc(100_002), truncated: true },
      {
        readerProvided: true,
      },
    ),
  ).toThrow(/100001-byte/);
});
