import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const completenessTemplate = readFileSync(
  fileURLToPath(new URL("../../../prompts/policy/combined-completeness.md", import.meta.url)),
  "utf8",
).trim();

export function combinedCompletenessGuidance(releaseGate) {
  const releaseRule = releaseGate
    ? "This release-gate rule overrides ordinary all-profile reporting: report only unresolved P0 and qualifying P1 blockers, and use exactly one valid no-issues sentinel for every category without such a blocker."
    : "P2 and P3 findings must be reported but must not block.";
  return completenessTemplate.replace("{{RELEASE_GATE_RULE}}", releaseRule);
}
