import { formatTestSpecEvidence } from "../../../src/combine/test-specs/evidence-output.mjs";
import { extractTestSpecPromptContext } from "../../../src/test-specs/prompt-context.mjs";

test("formats unavailable and invalid Test-spec outcomes", () => {
  expect(formatTestSpecEvidence({ status: "checkout-unavailable" })).toContain(
    "Adjacent eliware/test checkout is not supplied",
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
  const missing = extractTestSpecPromptContext(
    formatTestSpecEvidence({
      status: "records-missing",
      profiles: ["general.yaml", "application.yaml"],
      missing: ["application.yaml"],
    }),
  );
  expect(missing.instructions).toContain("missing application.yaml");
  const ready = formatTestSpecEvidence({
    status: "ready",
    profiles: ["general.yaml", "application.yaml", "cli.yaml", "npm-published.yaml"],
    excludedProfiles: ["web.yaml", "workspace.yaml"],
    rules: { dos: ["one", "two"], donts: ["three"] },
  });
  const extracted = extractTestSpecPromptContext(ready);
  expect(extracted.instructions).toContain(
    "This repository must comply with the rules set forth in general.yaml, application.yaml, cli.yaml, and npm-published.yaml.",
  );
  expect(extracted.instructions).toContain(
    "The following Eliware Test profiles do not apply to this repository: web.yaml and workspace.yaml.",
  );
  expect(extracted.instructions).toContain("Do:\n- one\n- two\n\nDon't:\n- three");
  expect(extracted.combined).not.toContain("Do:\n");
  expect(
    extractTestSpecPromptContext(
      formatTestSpecEvidence({ status: "ready", profiles: ["general.yaml"] }),
    ).instructions,
  ).toContain("Do:\n- None.");
  expect(
    extractTestSpecPromptContext(
      formatTestSpecEvidence({
        status: "ready",
        profiles: null,
        rules: { dos: [], donts: [] },
      }),
    ).instructions,
  ).toContain("No Eliware Test convention records apply");
});

test("names selected convention files when their contents are unavailable", () => {
  const unavailable = extractTestSpecPromptContext(
    formatTestSpecEvidence({
      status: "checkout-unavailable",
      profiles: ["general.yaml", "application.yaml"],
    }),
  );
  expect(unavailable.instructions).toContain(
    "This repository selects the Eliware Test convention files general.yaml and application.yaml.",
  );
  expect(unavailable.instructions).toContain("requirements are unknown");
});

test("states when no convention profiles apply", () => {
  expect(
    extractTestSpecPromptContext(
      formatTestSpecEvidence({ status: "ready", profiles: [], rules: { dos: [], donts: [] } }),
    ).instructions,
  ).toContain("No Eliware Test convention records apply to this repository.");
});
