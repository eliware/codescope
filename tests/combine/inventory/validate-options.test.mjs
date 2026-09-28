import { validateInventoryOptions } from "../../../src/combine/inventory/validate-options.mjs";

test("accepts positive integer concurrency", () => {
  expect(() => validateInventoryOptions(1)).not.toThrow();
  expect(() => validateInventoryOptions(8)).not.toThrow();
});

test("rejects zero, fractional, and nonnumeric concurrency", () => {
  for (const concurrency of [0, -1, 1.5, "2"]) {
    expect(() => validateInventoryOptions(concurrency)).toThrow(/positive integer/);
  }
});
