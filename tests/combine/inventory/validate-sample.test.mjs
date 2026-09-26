import { validateInventorySample } from "../../../src/combine/inventory/validate-sample.mjs";

test("normalizes a valid bounded sample", () => {
  expect(validateInventorySample({ data: "notes", truncated: false })).toEqual({
    bytes: Buffer.from("notes"),
    truncated: false,
  });
});

test("rejects malformed reader values", () => {
  expect(() => validateInventorySample("notes")).toThrow(/must return/);
  expect(() => validateInventorySample({ data: "notes", truncated: "no" })).toThrow(/must return/);
});

test("enforces byte-sample and truncation consistency", () => {
  expect(() => validateInventorySample({ data: Buffer.alloc(100_002), truncated: true })).toThrow(
    /100001-byte/,
  );
  expect(() => validateInventorySample({ data: Buffer.alloc(100_001), truncated: false })).toThrow(
    /without truncated/,
  );
  expect(() => validateInventorySample({ data: "short", truncated: true })).toThrow(/in-limit/);
});
