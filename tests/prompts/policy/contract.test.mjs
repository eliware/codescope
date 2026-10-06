import { contractPolicy } from "../../../src/prompts/policy/contract.mjs";
test("defines supplied repository contract boundaries", () => {
  expect(contractPolicy).toContain("Eliware Test");
  expect(contractPolicy).toContain("convention files named");
  expect(contractPolicy).toContain("named before their contents");
  expect(contractPolicy).not.toContain("eliware.apply");
  expect(contractPolicy).toContain("Treat missing information and absent");
  expect(contractPolicy).toMatch(/Eliware\s+Test\s+is the\s+authority/u);
  expect(contractPolicy).toContain("Examples explain a rule");
});
