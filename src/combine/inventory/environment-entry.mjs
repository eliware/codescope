import { execFile as execFileCallback } from "node:child_process";
import { lstat } from "node:fs/promises";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const GIT_TIMEOUT_MS = 2_000;

export function isEnvironmentFile(relativePath) {
  const name = relativePath.split("/").at(-1);
  return /^\.env(?:$|\.)/iu.test(name);
}

export async function runGitCommand(cwd, args, executeFile = execFile) {
  try {
    await executeFile("git", ["--literal-pathspecs", ...args], {
      cwd,
      encoding: "utf8",
      maxBuffer: 65_536,
      timeout: GIT_TIMEOUT_MS,
      windowsHide: true,
    });
    return 0;
  } catch (error) {
    return typeof error.code === "number" && !error.killed ? error.code : null;
  }
}

export async function getEnvironmentFileGitStatus(
  rootPath,
  relativePath,
  executeGit = runGitCommand,
) {
  const tracked = await executeGit(rootPath, ["ls-files", "--error-unmatch", "--", relativePath]);
  if (tracked === 0) return "tracked";
  if (tracked !== 1) return "unknown";

  const ignored = await executeGit(rootPath, [
    "check-ignore",
    "--quiet",
    "--no-index",
    "--",
    relativePath,
  ]);
  if (ignored === 0) return "untracked and ignored";
  if (ignored === 1) return "untracked and not ignored";
  return "unknown";
}

export async function formatEnvironmentFileEntry(
  rootPath,
  filePath,
  relativePath,
  { inspectFile = lstat, executeGit } = {},
) {
  const metadata = await inspectFile(filePath, { bigint: true });
  if (metadata.isSymbolicLink())
    throw new Error(`symlinked inventory files are not supported: ${relativePath}`);
  if (!metadata.isFile()) throw new Error(`inventory path is not a regular file: ${relativePath}`);

  const status = await getEnvironmentFileGitStatus(rootPath, relativePath, executeGit);
  return `${relativePath} | environment file | content omitted | Git status: ${status}`;
}
