import { validateSourceLimit } from "../../../src/review/options/validate-source-limit.mjs";

test("accepts positive integer and unlimited source limits", () => {
  expect(() => validateSourceLimit(1)).not.toThrow();
  expect(() => validateSourceLimit(Infinity)).not.toThrow();
});

test("rejects nonpositive, fractional, and nonfinite source limits", () => {
  for (const value of [0, -1, 1.5, NaN, -Infinity]) {
    expect(() => validateSourceLimit(value)).toThrow(/positive integer or Infinity/);
  }
});
