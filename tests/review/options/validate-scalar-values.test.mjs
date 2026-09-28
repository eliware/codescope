import { validateReviewScalarValues } from "../../../src/review/options/validate-scalar-values.mjs";

test("coordinates scalar option validation", () => {
  expect(() =>
    validateReviewScalarValues({
      maxSourceChars: 100,
      model: "gpt-6-luna",
      plainText: "review",
      add: ["note"],
      usage: false,
      dryRun: true,
    }),
  ).not.toThrow();
});
