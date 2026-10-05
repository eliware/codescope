import { transportPolicy } from "../../../src/prompts/policy/transport.mjs";

test("defines provider payload preservation and finding review labels", () => {
  expect(transportPolicy).toContain("exact provider response unchanged");
  expect(transportPolicy).toContain("initial and final provider results under separate labels");
  expect(transportPolicy).toContain("does not parse, validate, redact");
  expect(transportPolicy).toContain("provider requests exit successfully");
});
