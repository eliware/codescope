import { validateReviewScalars } from "../../../src/review/options/validate-scalars.mjs";

test("composes scalar-value and prompt-request validation", () => {
  expect(() =>
    validateReviewScalars({ maxSourceChars: 100, usage: false, dryRun: false }),
  ).not.toThrow();
  expect(() => validateReviewScalars({ maxSourceChars: 0 })).toThrow(/positive/);
  expect(() =>
    validateReviewScalars({ maxSourceChars: Infinity, plainText: "prompt", dryRun: true }),
  ).toThrow(/cannot be combined/);
});
