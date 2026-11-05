import {
  formatEnvironmentFileEntry,
  getEnvironmentFileGitStatus,
  isEnvironmentFile,
  runGitCommand,
} from "../../../src/combine/inventory/environment-entry.mjs";
import { jest } from "@jest/globals";

test.each([".env", ".env.local", "nested/.ENV.production"])(
  "recognizes environment file path %s",
  (relativePath) => {
    expect(isEnvironmentFile(relativePath)).toBe(true);
  },
);

test.each(["env", ".envrc", "nested/config.env"])(
  "does not classify unrelated path %s as an environment file",
  (relativePath) => {
    expect(isEnvironmentFile(relativePath)).toBe(false);
  },
);

test("reports a tracked file without checking ignore rules", async () => {
  const executeGit = jest.fn().mockResolvedValue(0);

  await expect(getEnvironmentFileGitStatus("repo", ".env", executeGit)).resolves.toBe("tracked");
  expect(executeGit).toHaveBeenCalledTimes(1);
  expect(executeGit).toHaveBeenCalledWith("repo", ["ls-files", "--error-unmatch", "--", ".env"]);
});

test.each([
  [0, "untracked and ignored"],
  [1, "untracked and not ignored"],
])("classifies an untracked file with ignore status %i", async (ignoreExitCode, expected) => {
  const executeGit = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(ignoreExitCode);

  await expect(getEnvironmentFileGitStatus("repo", ".env", executeGit)).resolves.toBe(expected);
  expect(executeGit).toHaveBeenCalledTimes(2);
  expect(executeGit).toHaveBeenLastCalledWith("repo", [
    "check-ignore",
    "--quiet",
    "--no-index",
    "--",
    ".env",
  ]);
});

test("reports unknown when Git cannot determine tracking status", async () => {
  const executeGit = jest.fn().mockResolvedValue(null);

  await expect(getEnvironmentFileGitStatus("not-a-repository", ".env", executeGit)).resolves.toBe(
    "unknown",
  );
  expect(executeGit).toHaveBeenCalledTimes(1);
});

test("reports unknown when Git cannot determine ignore status", async () => {
  const executeGit = jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(null);

  await expect(getEnvironmentFileGitStatus("repo", ".env", executeGit)).resolves.toBe("unknown");
});

test("runs Git without a shell and returns success", async () => {
  const executeFile = jest.fn().mockResolvedValue({ stdout: "" });

  await expect(runGitCommand("repo", ["status"], executeFile)).resolves.toBe(0);
  expect(executeFile).toHaveBeenCalledWith(
    "git",
    ["--literal-pathspecs", "status"],
    expect.objectContaining({ cwd: "repo", windowsHide: true }),
  );
});

test.each([
  [{ code: 1, killed: false }, 1],
  [{ code: "ENOENT", killed: false }, null],
  [{ code: 1, killed: true }, null],
])("maps Git process errors to status %s", async (details, expected) => {
  const executeFile = jest.fn().mockRejectedValue(details);

  await expect(runGitCommand("repo", ["status"], executeFile)).resolves.toBe(expected);
});

test("formats an environment file without reading it", async () => {
  await expect(
    formatEnvironmentFileEntry("repo", "repo/.env", ".env", {
      inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => true }),
      executeGit: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
    }),
  ).resolves.toBe(".env | environment file | content omitted | Git status: untracked and ignored");
});

test.each([
  [{ isSymbolicLink: () => true, isFile: () => false }, /symlinked inventory files/],
  [{ isSymbolicLink: () => false, isFile: () => false }, /not a regular file/],
])("rejects unsafe environment inventory entries", async (metadata, expectedError) => {
  await expect(
    formatEnvironmentFileEntry("repo", "repo/.env", ".env", {
      inspectFile: async () => metadata,
      executeGit: jest.fn(),
    }),
  ).rejects.toThrow(expectedError);
});

test("uses the default Git runner for tracked paths", async () => {
  await expect(getEnvironmentFileGitStatus(process.cwd(), "package.json")).resolves.toBe("tracked");
});

test("uses the default file inspector", async () => {
  await expect(
    formatEnvironmentFileEntry(process.cwd(), "package.json", "package.json"),
  ).resolves.toBe("package.json | environment file | content omitted | Git status: tracked");
});
