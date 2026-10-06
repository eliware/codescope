import { createConventionPrompt } from "../../src/prompts/conventions.mjs";

test("requests convention review over supplied artifacts without structural enforcement", () => {
  const result = createConventionPrompt((focus) => ({ focus }));
  expect(result.focus).toContain("convention files named before their contents");
  expect(result.focus).toContain("Review all supplied code, tests, docs");
  expect(result.focus).toContain("Treat missing information as unknown");
});
