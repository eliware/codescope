import { createConventionPrompt } from "../../src/prompts/conventions.mjs";

test("requests convention review over supplied artifacts without structural enforcement", () => {
  const result = createConventionPrompt((focus) => ({ focus }));
  expect(result.focus).toContain("convention files named immediately before");
  expect(result.focus).toContain("Review the supplied repository context");
  expect(result.focus).toContain("Treat missing information as unknown");
});
