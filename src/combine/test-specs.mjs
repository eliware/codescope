import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { readTestSpecApplicability } from "./test-specs/applicability.mjs";
import { discoverTestSpecFiles } from "./test-specs/discover.mjs";
import { selectTestSpecFiles } from "./test-specs/selection.mjs";
import { readTestSpecRecords } from "./test-specs/read-records.mjs";
import { formatTestSpecEvidence } from "./test-specs/evidence-output.mjs";

export async function combineTestSpecs(
  root,
  {
    testRoot = path.resolve(root, "..", "test"),
    readDirectory,
    readFileContents = readFile,
    readPackageJson = readFileContents,
    inspectFile = lstat,
    concurrency = 8,
    maxChars = Number.POSITIVE_INFINITY,
    platform = process.platform,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error("Test-spec read concurrency must be a positive integer");
  const applicability = await readTestSpecApplicability(root, {
    readPackageJson,
  });
  if (!applicability) {
    return formatTestSpecEvidence({ status: "applicability-unavailable" });
  }
  if (applicability.kind === "invalid") {
    return formatTestSpecEvidence({
      status: "applicability-invalid",
      reason: applicability.reason,
    });
  }
  if (applicability.skipSeparateRecords) return "";
  const discovery = await discoverTestSpecFiles(testRoot, { readDirectory, platform });
  if (!discovery) {
    return formatTestSpecEvidence({ status: "checkout-unavailable" });
  }
  const selection = selectTestSpecFiles(discovery.files, applicability);
  if (selection.missing.length > 0) {
    return formatTestSpecEvidence({ status: "records-missing", missing: selection.missing });
  }
  const sections = await readTestSpecRecords(discovery.specsRoot, selection.files, {
    concurrency,
    maxChars,
    readFileContents,
    inspectFile,
    platform,
  });
  return formatTestSpecEvidence({ status: "ready", sections });
}
