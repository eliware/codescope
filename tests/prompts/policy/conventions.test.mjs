import { conventionPolicy } from "../../../src/prompts/policy/conventions.mjs";

test("covers the supplied convention contract", () => {
  expect(conventionPolicy).toContain("supplied repository context");
  expect(conventionPolicy).toContain("convention files named immediately before their");
  expect(conventionPolicy).not.toContain("eliware.apply");
  expect(conventionPolicy).toContain("Treat missing information as unknown");
  expect(conventionPolicy).toContain("P1 for a proven issue");
  expect(conventionPolicy).toContain("P2 or P3");
  expect(conventionPolicy).toContain("Eliware Test");
  expect(conventionPolicy).toContain("the supplied repository context");
});
