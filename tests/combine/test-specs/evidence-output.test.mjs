import { formatTestSpecEvidence } from "../../../src/combine/test-specs/evidence-output.mjs";

test("formats unavailable and invalid Test-spec outcomes", () => {
  expect(formatTestSpecEvidence({ status: "checkout-unavailable" })).toContain(
    "Adjacent eliware/test checkout not supplied",
  );
  expect(formatTestSpecEvidence({ status: "applicability-unavailable" })).toContain(
    "Test-spec applicability unavailable",
  );
  expect(
    formatTestSpecEvidence({
      status: "applicability-unavailable",
      reason: "package.json could not be read",
    }),
  ).toContain("Test-spec applicability unavailable: package.json could not be read.");
  expect(
    formatTestSpecEvidence({ status: "applicability-invalid", reason: "bad package" }),
  ).toContain("Test-spec applicability invalid: bad package.");
});

test("formats missing-record and supplied-record outcomes", () => {
  expect(
    formatTestSpecEvidence({ status: "records-missing", missing: ["general", "cli"] }),
  ).toContain("missing records: general, cli");
  expect(formatTestSpecEvidence({ status: "ready", sections: ["one", "two"] })).toBe(
    "===== Eliware Test specifications =====\none\ntwo\n",
  );
});
