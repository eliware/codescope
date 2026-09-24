import { combinedResponseContract } from "../../../src/prompts/policy/combined-response-contract.mjs";

test("clarifies provider-output guidance without creating acceptance gates", () => {
  expect(combinedResponseContract).toContain("assume the repository's full test suite passes");
  expect(combinedResponseContract).toContain("not runtime acceptance gates");
  expect(combinedResponseContract).toContain("do not report the provider's returned JSON shape");
});
