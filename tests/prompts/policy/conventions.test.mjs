import { conventionPolicy } from "../../../src/prompts/policy/conventions.mjs";

test("covers the supplied convention contract", () => {
  expect(conventionPolicy).toContain("Review all supplied evidence");
  expect(conventionPolicy).toContain("convention files named before their contents");
  expect(conventionPolicy).not.toContain("eliware.apply");
  expect(conventionPolicy).toContain("Treat missing information as unknown");
  expect(conventionPolicy).toContain("Use P1 only for a proven issue");
  expect(conventionPolicy).toContain("P2 or P3");
  expect(conventionPolicy).toContain("Eliware Test");
  expect(conventionPolicy).toContain("all supplied evidence");
});
