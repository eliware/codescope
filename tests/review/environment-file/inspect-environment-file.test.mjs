import { inspectEnvironmentFile } from "../../../src/review/environment-file/inspect-environment-file.mjs";

test("confirms a safe regular file exists at startup", async () => {
  await expect(
    inspectEnvironmentFile("file", async () => ({
      dev: 1,
      ino: 2,
      isSymbolicLink: () => false,
      isFile: () => true,
    })),
  ).resolves.toBe(true);
});

test("classifies an absent file as missing", async () => {
  const error = Object.assign(new Error("missing"), { code: "ENOENT" });
  await expect(
    inspectEnvironmentFile("file", async () => {
      throw error;
    }),
  ).resolves.toBeNull();
});

test("reports a missing explicitly configured file", async () => {
  const error = Object.assign(new Error("missing"), { code: "ENOENT" });
  await expect(
    inspectEnvironmentFile(
      "configured.env",
      async () => {
        throw error;
      },
      true,
    ),
  ).rejects.toThrow("Unable to inspect configured.env: missing");
});

test("wraps inspection failures with the environment path", async () => {
  await expect(
    inspectEnvironmentFile("file", async () => {
      throw new Error("denied");
    }),
  ).rejects.toThrow("Unable to inspect file: denied");
});

test("rejects symbolic links and non-files during startup inspection", async () => {
  await expect(
    inspectEnvironmentFile("file", async () => ({ isSymbolicLink: () => true })),
  ).rejects.toThrow(/symbolic link/);
  await expect(
    inspectEnvironmentFile("file", async () => ({
      isSymbolicLink: () => false,
      isFile: () => false,
    })),
  ).rejects.toThrow(/regular file/);
});

test("preserves non-Error inspection causes", async () => {
  await expect(
    inspectEnvironmentFile("file", async () => {
      throw "denied";
    }),
  ).rejects.toThrow("Unable to inspect file: denied");
});
