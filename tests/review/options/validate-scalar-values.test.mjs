import { validateReviewScalarValues } from "../../../src/review/options/validate-scalar-values.mjs";

test("accepts supported scalar values and preserves addition text", () => {
  const add = ["  note  ", "second"];
  expect(() =>
    validateReviewScalarValues({
      maxSourceChars: Infinity,
      model: "gpt-6-luna",
      plainText: "prompt",
      add,
      usage: false,
      dryRun: true,
    }),
  ).not.toThrow();
  expect(add[0]).toBe("  note  ");
});

test("rejects invalid source limits, model, prompt text, additions, and flags", () => {
  const validate = (options) =>
    validateReviewScalarValues({ maxSourceChars: Infinity, ...options });
  expect(() => validate({ maxSourceChars: 1.5 })).toThrow(/positive/);
  expect(() => validate({ model: " " })).toThrow(/Model/);
  expect(() => validate({ model: "unsupported-model" })).toThrow(/Model/);
  expect(() => validate({ plainText: " " })).toThrow(/plainText/);
  expect(() => validate({ add: ["ok", 1] })).toThrow(/add/);
  expect(() => validate({ add: [" \t"] })).toThrow(/add/);
  expect(() => validate({ usage: "yes" })).toThrow(/boolean/);
  expect(() => validate({ dryRun: 1 })).toThrow(/boolean/);
});
