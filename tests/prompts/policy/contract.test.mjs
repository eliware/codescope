import { contractPolicy } from "../../../src/prompts/policy/contract.mjs";
test("defines supplied repository contract boundaries", () => {
  expect(contractPolicy).toContain("Eliware Test v8");
  expect(contractPolicy).toContain("applicability includes");
  expect(contractPolicy).toContain("one-shot");
  expect(contractPolicy).toContain("missing or unsupplied evidence as unknown");
  expect(contractPolicy).toContain("Eliware Test is the sole authority");
  expect(contractPolicy).toContain("Inline directive examples");
});
