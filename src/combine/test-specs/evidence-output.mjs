import { frameTestSpecPromptContext } from "../../test-specs/prompt-context.mjs";

export function formatTestSpecEvidence(result) {
  if (result.status === "checkout-unavailable")
    return frameTestSpecPromptContext(
      `${selectionText(result.profiles)}Adjacent eliware/test checkout is not supplied. The convention requirements are unknown.`,
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
      `${selectionText(result.profiles)}Convention contents are incomplete; missing ${result.missing.join(", ")}. The convention requirements are unknown.`,
    );
  const profileFiles = result.profiles ?? [];
  const applicability = profileFiles.length
    ? `This repository must comply with the rules set forth in ${formatList(profileFiles)}.`
    : "No Eliware Test convention records apply to this repository.";
  return frameTestSpecPromptContext(`${applicability}\n\n${formatRules(result.rules)}`);
}

function selectionText(profiles = []) {
  if (!profiles.length) return "No Eliware Test convention profiles are selected. ";
  return `This repository selects the Eliware Test convention files ${formatList(profiles)}. `;
}

function formatRules(rules = { dos: [], donts: [] }) {
  return `Do:\n${formatBullets(rules.dos)}\n\nDon't:\n${formatBullets(rules.donts)}`;
}

function formatBullets(rules) {
  return rules.length ? rules.map((rule) => `- ${rule}`).join("\n") : "- None.";
}

function formatList(values) {
  if (values.length < 2) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}
