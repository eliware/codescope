import { validatePromptOptions } from "../../../src/review/options/validate-prompt-options.mjs";

test("accepts nonblank prompt text and additions", () => {
  expect(() => validatePromptOptions({ plainText: "review", add: [" note "] })).not.toThrow();
  expect(() => validatePromptOptions({})).not.toThrow();
});

test("rejects blank prompt text and malformed additions", () => {
  expect(() => validatePromptOptions({ plainText: " " })).toThrow(/plainText/);
  for (const add of ["note", [" "], [2]]) {
    expect(() => validatePromptOptions({ add })).toThrow(/add must be an array/);
  }
});
