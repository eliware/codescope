import { formatTestSpecDeveloperInstructions } from "../../src/test-specs/developer-instructions.mjs";

test("formats convention instructions for the developer message", () => {
  expect(formatTestSpecDeveloperInstructions("Selected conventions.")).toBe(
    "Applicable Eliware Test conventions for this repository:\nSelected conventions.",
  );
});

test("returns no developer content when no conventions apply", () => {
  expect(formatTestSpecDeveloperInstructions("")).toBe("");
});
