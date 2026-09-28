import { assertWithinLimit } from "../../src/combine/assert-within-limit.mjs";

test("allows exact limits and rejects totals above the limit", () => {
  expect(() => assertWithinLimit(10, 10)).not.toThrow();
  expect(() => assertWithinLimit(11, 10)).toThrow(/10-character/);
});
