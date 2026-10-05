import { formatTestSpecEvidence } from "../../../src/combine/test-specs/evidence-output.mjs";
import { extractTestSpecPromptContext } from "../../../src/test-specs/prompt-context.mjs";

test("formats unavailable and invalid Test-spec outcomes", () => {
  expect(formatTestSpecEvidence({ status: "checkout-unavailable" })).toContain(
    "Adjacent eliware/test12 checkout is not supplied",
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

test("formats missing semantic specifications with and without excluded profiles", () => {
  expect(
    formatTestSpecEvidence({
      status: "records-missing",
      profiles: ["general"],
      missing: ["general"],
    }),
  ).toContain("Convention contents are incomplete; missing general.");
  expect(
    formatTestSpecEvidence({
      status: "records-missing",
      profiles: ["general"],
      missing: ["general"],
      excludedProfiles: ["cli"],
    }),
  ).toContain("This repository does not apply cli.");
});

test("puts profile applicability before complete semantic files", () => {
  const result = formatTestSpecEvidence({
    status: "ready",
    profiles: ["general", "application"],
    excludedProfiles: ["cli"],
    records: [
      { file: "general-semantic.yaml", contents: 'version: "12.0"\ndirectives: []\n' },
      { file: "application-semantic.yaml", contents: "description: full source\n" },
    ],
  });
  const context = extractTestSpecPromptContext(result);

  expect(context.instructions).toContain(
    "This repository applies general and application and does not apply cli.",
  );
  expect(context.instructions).toContain(
    'general conventions:\nConvention file: general-semantic.yaml\nversion: "12.0"\ndirectives: []\n',
  );
  expect(context.instructions).toContain(
    "\n\n---\n\napplication conventions:\nConvention file: application-semantic.yaml",
  );
  expect(context.instructions.indexOf("This repository applies")).toBeLessThan(
    context.instructions.indexOf("Convention file:"),
  );
  expect(context.instructions).toContain("does not apply cli");
});

test("handles an empty excluded-profile list in the applicability header", () => {
  expect(
    formatTestSpecEvidence({
      status: "ready",
      profiles: ["general"],
      records: [],
    }),
  ).toContain("This repository applies general and does not apply any other profiles.");
});

test("names selected semantic files when the adjacent checkout is unavailable", () => {
  const unavailable = extractTestSpecPromptContext(
    formatTestSpecEvidence({
      status: "checkout-unavailable",
      profiles: ["general", "application"],
    }),
  );
  expect(unavailable.instructions).toContain("This repository applies general and application.");
  expect(unavailable.instructions).toContain("requirements are unknown");
});

test("states when no convention profiles apply", () => {
  expect(
    extractTestSpecPromptContext(
      formatTestSpecEvidence({ status: "ready", profiles: [], records: [] }),
    ).instructions,
  ).toContain("No Eliware Test convention records apply to this repository.");
});

test("defaults omitted profiles and semantic files to empty lists", () => {
  expect(formatTestSpecEvidence({ status: "ready" })).toContain(
    "No Eliware Test convention records apply to this repository.",
  );
});
