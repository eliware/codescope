import { validateReviewScalars } from "../../../src/review/options/validate-scalars.mjs";

test("composes scalar-value and prompt-request validation", () => {
  expect(() =>
    validateReviewScalars({ maxSourceChars: 100, usage: false, dryRun: false }),
  ).not.toThrow();
});
