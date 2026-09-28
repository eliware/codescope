import { validateModelOption } from "../../../src/review/options/validate-model-option.mjs";

test("accepts configured models and an omitted model", () => {
  expect(() => validateModelOption(undefined)).not.toThrow();
  expect(() => validateModelOption("gpt-6-luna")).not.toThrow();
});

test("rejects blank, nonstring, and unsupported models consistently", () => {
  for (const model of ["", "  ", 4, "unknown-model"]) {
    expect(() => validateModelOption(model)).toThrow("Model must be a supported model string");
  }
});
