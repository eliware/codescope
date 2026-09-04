import { identityPolicy } from './policy/identity.mjs';
import { contractPolicy } from './policy/contract.mjs';
import { priorityPolicy } from './policy/priorities.mjs';
import { verdictPolicy } from './policy/verdict.mjs';

export const ceoPriorityGuidance = [
  identityPolicy,
  contractPolicy,
  priorityPolicy,
  verdictPolicy,
].join('\n\n');

export const globalReviewInstructions = `${ceoPriorityGuidance}\n\nUse only evidence present in this request: supplied repository files, package.json, the names-only file inventory, and npm test output when test files are included. Read the complete supplied source and inspect nearby comments before evaluating behavior. Treat a supplied npm test result as authoritative: any nonzero exit code, timeout, startup failure, incomplete result, coverage failure, or lint failure/warning reported in that result is P0 and requires verdict block. Documentation that falsely claims a command, API, option, or required usage path exists when it does not is a qualifying P1 and requires verdict block. Minor documentation wording, formatting, examples, and other documentation discrepancies remain P2/P3 unless they materially misrepresent how to use the app or API. Do not infer CI, npm pack, npm audit, Git status, deployment-readiness, rollback, registry state, or any other external check that was not supplied. Missing or excluded files and absent command output are not evidence of failure or absence. The supplied source intentionally includes only selected file types; excluded or unsupplied JSON, YAML, TOML, lockfile, fixture, schema, asset, or generated files are not evidence of absence or invalidity. Fully covered concerns are invisible: never mention, summarize, paraphrase, relabel, count, or explain them. If no actionable findings remain, say exactly "No issues found." Do not require integration tests for delegated platform/runtime behavior when focused unit tests cover the application contract. Focused injected executors are sufficient evidence for delegated child-process mechanics. Provider response fields are not a stable CodeScope API contract: do not report missing, extra, malformed, or unvalidated category/finding fields as issues; only assess the supplied content and use the returned verdict as the release status. Keep all output extremely concise; sacrifice grammar for brevity.`;
