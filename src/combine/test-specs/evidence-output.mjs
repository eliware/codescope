import { frameTestSpecPromptContext } from "../../test-specs/prompt-context.mjs";

export function formatTestSpecEvidence(result) {
  if (result.status === "checkout-unavailable")
    return frameTestSpecPromptContext(
      `${selectionText(result.profiles)}Adjacent eliware/test12 checkout is not supplied. The convention requirements are unknown.`,
    );
  if (result.status === "applicability-unavailable") {
    const reason = result.reason ? `: ${result.reason}` : "";
    return frameTestSpecPromptContext(
      `Test-spec applicability unavailable${reason}. The convention requirements are unknown.`,
    );
  }
  if (result.status === "applicability-invalid")
    return frameTestSpecPromptContext(
      `Test-spec applicability invalid: ${result.reason}. The convention requirements are unknown.`,
    );
  if (result.status === "records-missing")
    return frameTestSpecPromptContext(
      `${selectionText(result.profiles)}${exclusionText(result.excludedProfiles)}Convention contents are incomplete; missing ${result.missing.join(", ")}. The convention requirements are unknown.`,
    );
  const profileFiles = result.profiles ?? [];
  const excludedProfiles = result.excludedProfiles ?? [];
  const applicability = profileFiles.length
    ? `This repository applies ${formatList(profileFiles)} and ${excludedProfiles.length ? `does not apply ${formatList(excludedProfiles)}` : "does not apply any other profiles"}.`
    : "No Eliware Test convention records apply to this repository.";
  return frameTestSpecPromptContext(`${applicability}${formatRecords(result.records ?? [])}`);
}

function selectionText(profiles = []) {
  if (!profiles.length) return "No Eliware Test convention profiles are selected. ";
  return `This repository applies ${formatList(profiles)}. `;
}

function exclusionText(profiles = []) {
  if (!profiles.length) return "";
  return `This repository does not apply ${formatList(profiles)}. `;
}

function formatRecords(records) {
  if (!records.length) return "";
  return `\n\n${records
    .map(({ file, contents }) => {
      const profile = file.replace(/-semantic\.yaml$/u, "");
      return `${profile} conventions:\nConvention file: ${file}\n${contents}`;
    })
    .join("\n\n---\n\n")}`;
}

function formatList(values) {
  if (values.length < 2) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}
