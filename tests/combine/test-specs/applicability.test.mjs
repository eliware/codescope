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

test("rejects invalid profile names and absent eliware.apply declarations", async () => {
  for (const apply of [undefined, [1], [""], ["../outside"], ["nested/cli"], ["nested\\cli"]]) {
    await expect(
      readTestSpecApplicability("repo", {
        readPackageJson: async () => JSON.stringify({ eliware: { apply } }),
      }),
    ).resolves.toMatchObject({ kind: "invalid" });
  }
});

test("passes parsing and read failures through without reinterpreting them", async () => {
  await expect(
    readTestSpecApplicability("repo", { readPackageJson: async () => "{" }),
  ).resolves.toMatchObject({ kind: "invalid", reason: "package.json is not valid JSON" });
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => {
        throw new Error("permission denied");
      },
    }),
  ).resolves.toMatchObject({ kind: "unavailable" });
});

test("returns null when package.json is absent", async () => {
  await expect(readTestSpecApplicability("missing-package-root")).resolves.toBeNull();
  await expect(
    readTestSpecApplicability("repo", {
      readPackageJson: async () => {
        throw Object.assign(new Error("missing"), { code: "ENOENT" });
      },
    }),
  ).resolves.toBeNull();
});
