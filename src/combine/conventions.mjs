import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { readConventionApplicability } from "./convention/applicability.mjs";
import { discoverConventionFiles } from "./convention/discover.mjs";
import { resolveConventionSelection } from "./convention/resolve-selection.mjs";
import { readConventionRecords } from "./convention/read-records.mjs";
import { formatConventionEvidence } from "./convention/evidence-output.mjs";

export async function combineConventionFiles(
  root,
  {
    conventionsRoot = path.resolve(root, "..", "conventions"),
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
    throw new Error("Convention read concurrency must be a positive integer");
  const discovery = await discoverConventionFiles(conventionsRoot, { readDirectory, platform });
  if (!discovery) {
    return formatConventionEvidence({ status: "checkout-unavailable" });
  }
  const applicability = await readConventionApplicability(root, {
    conventionsRoot,
    readPackageJson,
    readFileContents,
    platform,
  });
  if (!applicability) {
    return formatConventionEvidence({ status: "applicability-unavailable" });
  }
  if (applicability.kind === "invalid") {
    return formatConventionEvidence({
      status: "applicability-invalid",
      reason: applicability.reason,
    });
  }
  let selection;
  try {
    selection = await resolveConventionSelection(discovery, applicability, {
      readFileContents,
      inspectFile,
      platform,
    });
  } catch (cause) {
    return formatConventionEvidence({ status: "index-unavailable", reason: cause.message });
  }
  if (selection.missing.length > 0) {
    return formatConventionEvidence({ status: "records-missing", missing: selection.missing });
  }
  const sections = await readConventionRecords(discovery.specsRoot, selection.files, {
    concurrency,
    maxChars,
    readFileContents,
    inspectFile,
    platform,
  });
  return formatConventionEvidence({ status: "ready", sections });
}
