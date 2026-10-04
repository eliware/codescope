import { contractPolicy } from "../../../src/prompts/policy/contract.mjs";
test("defines supplied repository contract boundaries", () => {
  expect(contractPolicy).toContain("Eliware Test");
  expect(contractPolicy).toContain("convention files named");
  expect(contractPolicy).toContain("immediately before their contents");
  expect(contractPolicy).not.toContain("eliware.apply");
  expect(contractPolicy).toContain("Treat missing information");
  expect(contractPolicy).toMatch(/Eliware\s+Test\s+is the sole authority/u);
  expect(contractPolicy).toContain("inline examples");
});
