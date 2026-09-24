import { formatConventionEvidence } from "../../../src/combine/convention/evidence-output.mjs";

test("formats unavailable and invalid convention outcomes", () => {
  expect(formatConventionEvidence({ status: "checkout-unavailable" })).toContain(
    "Convention checkout not supplied",
  );
  expect(formatConventionEvidence({ status: "applicability-unavailable" })).toContain(
    "Convention applicability unavailable",
  );
  expect(
    formatConventionEvidence({ status: "applicability-invalid", reason: "bad package" }),
  ).toContain("Convention applicability invalid: bad package.");
  expect(
    formatConventionEvidence({ status: "index-unavailable", reason: "read denied" }),
  ).toContain("Convention directive index unavailable: read denied.");
});

test("formats missing-record and supplied-record outcomes", () => {
  expect(
    formatConventionEvidence({ status: "records-missing", missing: ["general", "cli"] }),
  ).toContain("missing records: general, cli");
  expect(formatConventionEvidence({ status: "ready", sections: ["one", "two"] })).toBe(
    "===== Convention v8 JSON =====\none\ntwo\n",
  );
});
