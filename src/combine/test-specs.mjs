import { lstat, open, readFile } from "node:fs/promises";
import path from "node:path";
import { readTestSpecApplicability } from "./test-specs/applicability.mjs";
import { discoverTestSpecFiles } from "./test-specs/discover.mjs";
import { selectTestSpecFiles } from "./test-specs/selection.mjs";
import { readTestSpecRecords } from "./test-specs/read/records.mjs";
import { formatTestSpecEvidence } from "./test-specs/evidence-output.mjs";

export async function combineTestSpecs(
  root,
  {
    testRoot,
    readDirectory,
    readFileContents = readFile,
    readPackageJson,
    inspectFile = lstat,
    inspectRoot = lstat,
    openFile = open,
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  const pathApi = platform === "win32" ? path.win32 : path.posix;
  testRoot ??= pathApi.resolve(root, "..", "test12");
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error("Test-spec read concurrency must be a positive integer");
  const applicability = await readTestSpecApplicability(root, {
    readPackageJson,
    inspectFile,
    openFile,
  });
  if (!applicability) {
    return formatTestSpecEvidence({ status: "applicability-unavailable" });
  }
  if (applicability.kind === "unavailable") {
    return formatTestSpecEvidence({
      status: "applicability-unavailable",
      reason: applicability.reason,
    });
  }
  if (applicability.kind === "invalid") {
    return formatTestSpecEvidence({
      status: "applicability-invalid",
      reason: applicability.reason,
    });
  }
  if (applicability.skipSeparateRecords) return "";
  const profiles = [...applicability.profiles];
  const discovery = await discoverTestSpecFiles(testRoot, { readDirectory, inspectRoot, platform });
  if (!discovery) {
    return formatTestSpecEvidence({ status: "checkout-unavailable", profiles });
  }
  const selection = selectTestSpecFiles(discovery.files, applicability);
  if (selection.missing.length > 0) {
    return formatTestSpecEvidence({
      status: "records-missing",
      profiles,
      missing: selection.missing,
      excludedProfiles: selection.excludedProfiles,
    });
  }
  const sources = await readTestSpecRecords(discovery.specsRoot, selection.files, {
    concurrency,
    maxChars,
    readFileContents,
    inspectFile,
    platform,
  });
  return formatTestSpecEvidence({
    status: "ready",
    profiles,
    excludedProfiles: selection.excludedProfiles,
    records: selection.files.map((file, index) => ({ file, contents: sources[index] })),
  });
}
