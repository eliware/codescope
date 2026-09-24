import { readTestSpecApplicability } from "../../../src/combine/test-specs/applicability.mjs";

test("resolves selected Test spec records from eliware.apply", async () => {
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => JSON.stringify({ eliware: { apply: ["general", "cli"] } }),
    }),
  ).resolves.toMatchObject({
    profiles: new Set(["general", "cli"]),
    canonicalPaths: new Map([
      ["general", "general.json"],
      ["cli", "cli.json"],
    ]),
    skipSeparateRecords: false,
  });
});

test("skips separate profile records for eliware-test", async () => {
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => JSON.stringify({ name: "@eliware/test" }),
    }),
  ).resolves.toMatchObject({ skipSeparateRecords: true });
});

test("rejects malformed and unsafe profile applicability", async () => {
  for (const apply of [[1], [""], ["  cli  "], ["../outside"], ["nested/cli"], ["nested\\cli"]]) {
    await expect(
      readTestSpecApplicability("repo", {
        readPackageJson: async () => JSON.stringify({ eliware: { apply } }),
      }),
    ).resolves.toMatchObject({ kind: "invalid" });
  }
});

test("reports malformed package JSON, invalid package shapes, and read errors", async () => {
  await expect(
    readTestSpecApplicability("repo", { readPackageJson: async () => "{" }),
  ).resolves.toMatchObject({ kind: "invalid", reason: "package.json is not valid JSON" });
  await expect(
    readTestSpecApplicability("repo", { readPackageJson: async () => "[]" }),
  ).resolves.toMatchObject({ kind: "invalid", reason: "package.json must contain an object" });
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => {
        throw new Error("permission denied");
      },
    }),
  ).resolves.toMatchObject({ kind: "invalid", reason: "package.json could not be read" });
});

test("returns unavailable for a missing package", async () => {
  await expect(readTestSpecApplicability("missing")).resolves.toBeNull();
});
