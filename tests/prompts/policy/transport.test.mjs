import { transportPolicy } from "../../../src/prompts/policy/transport.mjs";

test("defines provider payload preservation and finding review labels", () => {
  expect(transportPolicy).toContain("print the API response unchanged");
  expect(transportPolicy).toContain("first and final results under separate labels");
  expect(transportPolicy).toContain("does not parse, check, redact");
  expect(transportPolicy).toContain("successful API request exits with success");
});
