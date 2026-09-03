export const defaultDeveloperText =
  'Review the following JavaScript source files and identify actionable issues:\n\n';
export const REVIEW_CATEGORIES = [
  'correctness',
  'security',
  'reliability',
  'performance',
  'architecture',
  'api_design',
  'cross_platform',
  'tests',
  'documentation',
];
export const SUGGESTION_CATEGORIES = [...REVIEW_CATEGORIES, 'new-features'];
export function createReviewTool(categories = REVIEW_CATEGORIES) {
  return {
    type: 'function',
    name: 'submit_review',
    description: 'Return the complete Codescope review result.',
    strict: true,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        issues: {
          type: 'object',
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              { type: 'array', minItems: 1, items: { $ref: '#/$defs/issue' } },
            ]),
          ),
          required: [...categories],
        },
        verdict: { type: 'string', enum: ['pass', 'block'] },
      },
      required: ['issues', 'verdict'],
      $defs: {
        issue: {
          type: 'object',
          additionalProperties: false,
          properties: {
            severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
            location: { type: 'string' },
            issue: { type: 'string' },
            ignore_example: { type: 'string' },
          },
          required: ['severity', 'location', 'issue', 'ignore_example'],
        },
      },
    },
  };
}
export const reviewTool = createReviewTool();
export function createSuggestionTool(categories = SUGGESTION_CATEGORIES) {
  return {
    type: 'function',
    name: 'submit_suggestions',
    description: 'Return concise actionable improvement suggestions.',
    strict: true,
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        suggestions: {
          type: 'object',
          additionalProperties: false,
          properties: Object.fromEntries(
            categories.map((category) => [
              category,
              { type: 'array', minItems: 1, items: { $ref: '#/$defs/suggestion' } },
            ]),
          ),
          required: [...categories],
        },
      },
      required: ['suggestions'],
      $defs: {
        suggestion: {
          type: 'object',
          additionalProperties: false,
          properties: {
            location: { type: 'string' },
            suggestion: { type: 'string' },
            rationale: { type: 'string' },
            ignore_example: { type: 'string' },
          },
          required: ['location', 'suggestion', 'rationale', 'ignore_example'],
        },
      },
    },
  };
}
export const suggestionTool = createSuggestionTool();
// The review prompt treats focused injected-executor tests as the package contract; no subprocess integration test is required here.
const ceoPriorityGuidance = `# CodeScope finding priorities

Classify each finding using the highest applicable priority. Do not escalate a finding merely because it sounds serious. Require concrete evidence from the supplied code, tests, configuration, documentation, or execution results.

## Eliware release-contract rules

When the supplied repository content establishes a required project standard,
treat violations as release findings. Use only standards visible in the
supplied files and test output.

For maintained Node.js repositories, the normal required contract includes:

- native ESM and \`type: module\` where applicable;
- \`npm test\` and \`npm run lint\` scripts where the repository convention
  applies;
- genuine 100×4 coverage for in-scope non-barrel production logic;
- no Istanbul ignore outside pure barrel/re-export files;
- focused tests corresponding to new or changed production modules;
- matching source/test structure where the repository uses the mirrored layout;
- focused modules and thin entrypoints;
- synchronized package metadata, exports, declarations, README, release notes,
  and lockfile when those files are supplied;
- no plaintext secrets, tokens, private keys, \`.env\` contents, or decrypted
  runtime state;
- safe argument-array process execution instead of shell quoting or unsafe
  pipelines;
- release workflows that publish only from authorized version tags when the
  workflow file is supplied;
- required validation commands represented consistently in package scripts,
  CI, and Knit configuration when those files are supplied.

A violation is P1 only when it affects required behavior, required validation,
security, release correctness, or makes a passing result untrustworthy.
Architecture preferences alone remain P2.

Required source/test structure is P1 only when a missing mirror leaves required
behavior or required coverage unverified. Pure barrels, generated files,
configuration-only files, and explicitly excluded adapters do not require a
one-to-one test file.

Do not downgrade a proven validation-integrity defect because the current test
command passes. A passing command does not prove that coverage or validation
measured the intended behavior.

## P0 — Emergency or test-gate failure

Use P0 for an active or imminent severe incident, or any supplied test that
was executed and failed. Any supplied test that was executed and failed is a
release-blocking P0 regardless of whether the test is required or optional.

- Active service outage affecting a required service.
- Confirmed or imminent irreversible data loss or corruption.
- Confirmed critical credential, secret, or private-key exposure.
- A security defect that permits immediate unauthorized access or destructive control.
- A production action currently causing uncontrolled damage.
- Any Istanbul ignore outside a pure barrel/re-export file.
P0 requires immediate action. It blocks all releases and may justify emergency intervention.

Do not use P0 for theoretical risks, ordinary bugs, missing tests, stale
documentation, or unused code unless the finding includes a concrete test
that was executed and failed. A concrete executed failing test is always P0.
Istanbul ignores are permitted only in pure barrel/re-export files. When an
Istanbul ignore appears elsewhere, report it as P0 and recommend removing the
ignore, adding focused tests, refactoring the implementation for testability,
or removing a truly unreachable or untestable branch.

## P1 — Release blocker

Use P1 only when every condition below is true:

1. The finding is reproducible or directly proven by concrete evidence.
2. It affects required behavior in the current release scope.
3. It causes a required test, contract, validation gate, or acceptance path to fail or remain unverified.
4. It could cause data loss, unsafe behavior, security failure, incorrect production operation, or a materially misleading release.
5. It cannot reasonably be deferred without making this release unsafe or incomplete.
6. The finding has a specific actionable correction.

Validation-integrity defects are qualifying P1 findings when they can make a
green result untrustworthy, even if the current test command exits successfully.
This includes ignored coverage counters, incorrect coverage derivation,
coverage artifacts that can be mixed or overwritten between runs, and missing
checks that permit a required validation result to report success incorrectly.
Treat the defect itself as P1; classify a missing regression test separately
as P2 unless that test failure is supplied and executed.

Examples:

- Documentation falsely claims a command, API, option, or required usage path exists when it does not.
- Required release validation cannot run for a reason other than a failing
  supplied test.
- Backup restore cannot be verified.
- Restore code can target production accidentally.
- Required cleanup fails after restore errors.
- Credentials or secrets can be exposed by the released path.
- A required API contract is broken.
- The package cannot build, install, start, or perform its declared core function.
- A mandatory release artifact is missing or generated from the wrong commit.
- A required production or deployment configuration is invalid.
- Coverage or validation logic can report a passing result while omitting
  required source lines, branches, functions, or statements.
- Concurrent or stale validation artifacts can contaminate a required result,
  produce a false pass, or make the result non-deterministic.
- Required source logic lacks a corresponding test and the omission leaves
  required behavior or the 100×4 gate unverified.

Do not use P1 for:

- Minor documentation wording, formatting, examples, or other discrepancies that do not misrepresent available commands, APIs, options, or required usage.
- Missing tests for optional or out-of-scope behavior.
- Broad coverage below an ideal target when required paths are tested.
- Refactoring opportunities.
- Duplicate logic.
- Unused parameters.
- Performance improvements without demonstrated release impact.
- Hypothetical future failures.
- Features explicitly deferred from the release.

## P2 — Important follow-up

Use P2 for a real, actionable issue that should be addressed but does not block the current release.

Examples:

- Noncritical missing test coverage.
- Documentation that is inaccurate but does not affect safe operation.
- Weak diagnostics.
- Moderate performance concerns.
- Duplicate or unnecessarily complex logic.
- Limited edge cases outside the required acceptance path.
- Cleanup or maintainability work.
- Hardening that is useful but not required for this release.
- Behavior affecting optional features.
- Issues in code scheduled for a later release.

P2 findings must not change the overall verdict from pass to block.

## P3 — Polish and convenience

Use P3 for low-risk improvements:

- Formatting and style suggestions.
- Naming improvements.
- Comments and wording.
- Minor documentation polish.
- Convenience features.
- Nonessential optimization.
- Optional refactoring.
- Cosmetic UX improvements.
- Developer-experience suggestions with no current functional impact.

P3 findings must never block a release.

# Verdict

Return \`block\` only when at least one unresolved P0 or qualifying P1 exists.

Return \`pass\` when:

- No unresolved P0 exists.
- No unresolved qualifying P1 exists.
- P2 and P3 findings may remain.

Do not add a separate rule that blocks for documentation discrepancies or major test gaps. Those are P1 only when they satisfy the full P1 definition above.

# Evidence requirements

Every P0 or P1 must include:

- Exact file and line or executable path.
- Concrete evidence.
- Reproduction or failing command when available.
- Required behavior or acceptance criterion affected.
- Why deferral would make the current release unsafe or misleading.
- Smallest practical correction.

If the evidence is insufficient, classify the finding as P2 or P3 and state what evidence would be needed to escalate it.

# Release-scope rule

Evaluate only the behavior, files, interfaces, and acceptance criteria included in the current release. Do not block a release for deferred features, unrelated repositories, ideal future architecture, optional integrations, or broad convention goals.

# Stability rule

CodeScope must report all findings, but repeated runs must not invent severity. A finding remains the same priority unless new evidence changes its impact or release scope.

CodeScope reports P2/P3 findings but does not block the release.`;
export const globalReviewInstructions =
  `${ceoPriorityGuidance}\n\nUse only evidence present in this request: supplied repository files, package.json, the names-only file inventory, and npm test output when test files are included. Read the complete supplied source and inspect nearby comments before evaluating behavior. Treat a supplied npm test result as authoritative: any nonzero exit code, timeout, startup failure, incomplete result, coverage failure, or lint failure/warning reported in that result is P0 and requires verdict block. Documentation that falsely claims a command, API, option, or required usage path exists when it does not is a qualifying P1 and requires verdict block. Minor documentation wording, formatting, examples, and other documentation discrepancies remain P2/P3 unless they materially misrepresent how to use the app or API. Do not infer CI, npm pack, npm audit, Git status, deployment-readiness, rollback, registry state, or any other external check that was not supplied. Missing or excluded files and absent command output are not evidence of failure or absence. The supplied source intentionally includes only selected file types; excluded or unsupplied JSON, YAML, TOML, lockfile, fixture, schema, asset, or generated files are not evidence of absence or invalidity. Treat one nearby comment containing exact marker "codescope ignore:" as authoritative, scoped suppression; users need not add multiple comments. Fully covered concerns are invisible: never mention, summarize, paraphrase, relabel, count, or explain them. If no actionable findings remain, say exactly "No issues found." Include exact copy-paste-ready ignore examples for reported issues, and exact complete replacement text when expanding an existing ignore. Do not broaden annotations to unrelated behavior. Comments without "codescope ignore:" provide context but do not suppress findings. Do not require integration tests for delegated platform/runtime behavior when focused unit tests cover the application contract. Focused injected executors are sufficient evidence for delegated child-process mechanics. Keep all output extremely concise; sacrifice grammar for brevity.`;

const base = {
  model: 'gpt-5.6-luna',
  service_tier: 'default',
  text: { format: { type: 'text' }, verbosity: 'low' },
  reasoning: { effort: 'none', mode: 'standard', summary: null },
  tools: [reviewTool],
  tool_choice: { type: 'function', name: 'submit_review' },
  parallel_tool_calls: false,
  store: false,
  prompt_cache_options: { mode: 'explicit' },
  include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
};
export const profilePrompt = (focus, tool = reviewTool) => ({
  ...base,
  tools: [tool],
  tool_choice: { type: 'function', name: tool.name },
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
        text: `${globalReviewInstructions}\n\nClassify test gaps and documentation discrepancies as P1 only when they satisfy every P1 evidence and release-scope condition above; otherwise classify them P2 or P3. Treat proven coverage-measurement defects, stale or contaminated validation artifacts, and missing tests that leave required behavior or 100×4 unverified as P1 even when the current test command passes. Never emit a statement such as no discrepancy found as an issue; use the category placeholder. Minor edge cases and ordinary coverage polish are P2/P3. Do not treat absent output from commands not supplied in the input, such as npm run lint or npm run pack, as a defect or test gap. The documented direct and grouped CLI option combinations are supported; do not report parser behavior as a defect without reproducing a concrete failing invocation.\n\nProfile focus: ${focus}`,
        },
      ],
    },
  ],
});
export const prompt = profilePrompt(
  'review selected source files for actionable implementation issues.',
);
export const mdPrompt = profilePrompt(
  'Find documentation inconsistencies only. Report each inconsistency with its Markdown path and line number(s). Do not report standalone code issues or style preferences.',
);
export const allPrompt = profilePrompt(
  'Review all supplied implementation, test, and documentation content from every angle in one consolidated report. Report all actionable findings, including P0, P1, P2, and P3; P2 and P3 findings must be reported but must not affect the verdict. Apply the Eliware release-contract and validation-integrity rules exactly; a passing test command does not downgrade a proven coverage or validation defect. Never report a documentation issue unless there is a concrete contradiction or unsupported claim; if your analysis says no discrepancy exists, emit the exact Documentation placeholder instead. A statement that no discrepancy exists is never an issue. Classify documentation discrepancies and test gaps as P1 only when they satisfy every CEO P1 condition; otherwise use P2 or P3. Do not demand subprocess integration tests when focused injected-executor tests are explicitly marked as the complete contract for delegated runtime behavior. Every issue category array must contain at least one item; when empty, emit one P3 placeholder with location `none`, issue `No issues found.`, and empty `ignore_example`. Group findings under these headings, in exactly this order: Correctness, Security, Reliability, Performance, Architecture, API Design, Tests, Documentation. Assign each underlying issue to one best-fit category only; do not duplicate the same issue across categories. Honor all global ignore rules and apply the global pass/block criteria.',
);
export const combinedAllPrompt = {
  ...allPrompt,
  tools: [reviewTool, suggestionTool],
  tool_choice: 'auto',
  parallel_tool_calls: true,
  input: [
    ...allPrompt.input.map((message) =>
      message.role === 'user'
        ? {
            ...message,
            content: message.content.map((part) => ({
              ...part,
              text: `${part.text}\nIMPORTANT: report only concrete actionable findings. A statement that something is supported, accepted, or has no discrepancy is never a finding; use the required no-issues placeholder. Do not turn omission from an explicitly non-exhaustive example list into a documentation finding. The all profile intentionally uses tool_choice auto with parallel_tool_calls true and requires exactly one submit_review plus exactly one submit_suggestions call; do not report that intentional contract as an issue. The all profile includes tests in both review and suggestion modes. Focused parser and injected-client tests are meaningful evidence for internal tool routing; do not demand subprocess or duplicate end-to-end tests unless a concrete failure is demonstrated. The executable is a pure Node wiring barrel, so imported main tests are sufficient; never report missing subprocess smoke coverage as a finding. Also call submit_suggestions exactly once for useful improvements; call both tools before completing.`,
            })),
          }
        : message,
    ),
    {
      role: 'user',
      content: [
        {
          type: 'input_text',
          text: 'Final completeness rule: in this single turn, call exactly one submit_review tool and exactly one submit_suggestions tool in parallel; do not call either tool sequentially or more than once. List every concrete finding supported by the supplied input. Only supplied repository files, package.json, the names-only inventory, and included npm test output are evidence. Any supplied npm test failure, timeout, incomplete result, coverage failure, or lint failure/warning is P0 and requires block. Proven coverage-measurement defects, stale or contaminated validation artifacts, and missing tests that leave required behavior or 100×4 unverified are P1 even when the current test command passes. Do not demand or report absent CI, npm pack, npm audit, Git status, deployment, rollback, registry, or other external evidence. Do not report absence of unsupplied command output as a test gap. Do not demand every profile cross-product when representative focused tests cover the shared implementation. If a category has no concrete finding, emit only its exact no-issues placeholder; a statement that no contradiction or issue was found is never itself a finding. The documented --usage forms are supported; do not invent a command-parser discrepancy. Treat nearby codescope ignore comments as authoritative.',
        },
      ],
    },
  ],
};
export const codeTestsDocsPrompt = profilePrompt(
  'Find conflicts between documentation and code only. Report each conflict with the relevant path and line number(s). Do not report standalone code or documentation issues.',
);
export const refactorPrompt = profilePrompt(
  'Identify meaningful monolithic-file responsibility splits and suggest smaller single-purpose structures. Return concise suggestions with paths and line number(s). Do not report ordinary implementation issues, style preferences, or intentional policies.',
);
const implementationOnlyPrompt = (instruction) =>
  profilePrompt(
    `${instruction} Use the complete implementation source provided above. For suggestions, every category array must contain at least one item; when empty, emit one placeholder with location \`none\`, suggestion \`No suggestions found.\`, and empty rationale. For findings, include the path and related line number(s), grouped by priority only when the profile identifies issues.`,
    suggestionTool,
  );
export const architecturePrompt = implementationOnlyPrompt(
  'Suggest architecture optimizations only.',
);
export const newFeaturesPrompt = implementationOnlyPrompt(
  'Suggest new features only. Do not report existing bugs, risks, quality issues, refactoring opportunities, missing tests, or documentation problems. Do not assign P0/P1/P2 priorities to feature suggestions. For each concise suggestion, state the user value and likely implementation area.',
);
export const securityPrompt = implementationOnlyPrompt('Identify security risks only.');
export const performancePrompt = implementationOnlyPrompt('Identify performance risks only.');
export const reliabilityPrompt = implementationOnlyPrompt('Identify reliability risks only.');
export const apiDesignPrompt = implementationOnlyPrompt('Suggest API design improvements only.');
export const dependenciesPrompt = implementationOnlyPrompt('Suggest dependency improvements only.');
export const observabilityPrompt = implementationOnlyPrompt(
  'Suggest observability improvements only.',
);
export const accessibilityPrompt = implementationOnlyPrompt(
  'Suggest accessibility improvements only for user-facing behavior.',
);
export const quickWinsPrompt = implementationOnlyPrompt(
  'Suggest only high-value, low-effort improvements.',
);
export const prioritizePrompt = implementationOnlyPrompt(
  'Prioritize existing improvement opportunities only.',
);
export const priorityPrompt = (maximum) =>
  profilePrompt(
    `Use the same comprehensive review discipline as the all profile over all supplied implementation, test, and documentation content. Report every concrete finding from P0 through P${maximum} and omit findings above P${maximum}; the only difference from all is this priority ceiling. Use all review categories in the fixed order: correctness, security, reliability, performance, architecture, api_design, tests, documentation. Only P0 or P1 findings block the verdict; P2 and P3 findings never block, including for p0-2 and p0-3. A category with no concrete defect MUST contain exactly one placeholder: severity P3, location none, issue No issues found., ignore_example empty string. Never classify wording such as no concrete issue established, no security issue, or intentional behavior as P1; those are placeholders, not findings. Verify claimed CLI behavior against the supplied parser before reporting it. Direct all --dry-run and grouped review all --dry-run are both supported and tested; do not report that contract as a defect. Do not report option ordering or equivalent canonical/commutative CLI syntax as a defect when both forms are parsed consistently, and do not demand every permutation as a separate test. Do not report the intentional suggestion-only new-features alias or its effective suggestion-schema validation as an issue. Do not report the provider-owned validation of allowed prompt fields, the accepted config-file replacement race between metadata inspection and read, textual test-result marker policy, missing files, external validation evidence, or additional cross-product/end-to-end tests when representative focused tests cover the shared implementation. Honor all global ignore rules and treat deliberate tool routing, environment inheritance, verdict normalization, injected-collaborator boundaries, platform-specific policy, test-output handling, finite-limit deterministic reads, mode-specific routing, and generic all-suggestion routing as intentional unless there is a concrete correctness or security failure.`,
    createReviewTool(),
  );
export const createAnalysisPrompt = (subject) =>
  profilePrompt(
    `${subject} Report each issue as one concise bullet, grouped by priority P0, P1, P2, etc., with the affected path and related line number(s).`,
  );
