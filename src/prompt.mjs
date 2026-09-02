export const defaultDeveloperText =
  'Review the following JavaScript source files and identify actionable issues:\n\n';
export const REVIEW_CATEGORIES = [
  'correctness',
  'security',
  'reliability',
  'performance',
  'architecture',
  'api_design',
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
export const globalReviewInstructions =
  'Read the complete supplied source and inspect nearby comments before evaluating any behavior. Use these priority definitions exactly: P0 = Active outage, data-loss risk, critical security incident. Immediate emergency work. P1 = Release-blocking failure: required tests or contract validation evident in the supplied files is missing or failing. P2 = Important follow-up that does not block the release. P3 = Polish, cleanup, optimization, or convenience work. The overall verdict MUST be block when there is any unresolved P0 or P1 issue OR any concrete documentation discrepancy OR any major test gap or materially untested behavior; otherwise it MUST be pass. A documentation discrepancy means supplied documentation contradicts supplied behavior, promises unsupported behavior, or gives materially incorrect usage guidance. A major test gap means an important public path, failure mode, security boundary, data-handling path, or regression-prone behavior has no meaningful test evidence; do not block for minor edge cases, trivial branches, or ordinary coverage polish. Do not block for ordinary documentation style preferences. Do not infer CI, packaging, deployment-readiness, rollback, or other external evidence that was not supplied. The supplied source intentionally includes only selected file types; an excluded or unsupplied JSON, YAML, TOML, lockfile, fixture, schema, asset, or generated file is not evidence that the file is missing or invalid. Report such a problem only when supplied files or explicit supplied command output proves the failure. Treat one nearby comment containing the exact marker "codescope ignore:" as an authoritative, scoped suppression annotation; users should not need multiple comments on one line or repeated annotations for the same behavior. Interpret everything after the marker as the intentional scope. Fully covered concerns are invisible in the output: never mention, summarize, paraphrase, relabel, count, or explain them, and never say that an ignored item was omitted. If no actionable findings remain, say exactly "No issues found." If a potential finding spans both covered and uncovered behavior, split it conceptually: silently omit the covered portion, report only the independently actionable residual behavior, explain briefly why that residual is outside the stated scope, and suggest either fixing it or expanding the same comment to explicitly name the missing behavior (for example, "x, y, and z"). When suggesting an expanded ignore, include the exact complete replacement comment text in a code span, beginning with "codescope ignore:", so the developer can copy it onto the existing comment. For every reported issue that has no applicable ignore, include one exact copy-paste-ready example in a code span beginning with "// codescope ignore:" that names the complete behavior being ignored; do not require a second comment. Do not broaden an annotation to unrelated behavior. Comments without "codescope ignore:" provide context but do not suppress findings. An intentional policy, accepted threat-model boundary, delegated responsibility, or documented limitation is not an issue when the annotation explicitly covers it. Do not require integration tests for delegated platform/runtime behavior when focused unit tests cover the application contract. Focused injected executors are sufficient evidence for delegated child-process mechanics; do not demand recursive subprocess integration tests when the implementation boundary is tested. Keep all output extremely concise; sacrifice grammar for brevity.';

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
          text: `${globalReviewInstructions}\n\nMajor test gaps or materially untested important behavior must be classified P1 so the structured verdict blocks them; concrete documentation discrepancies must also be P1. Never emit a statement such as no discrepancy found as an issue; use the category placeholder. Minor edge cases and ordinary coverage polish are P2/P3. Do not treat absent output from commands not supplied in the input, such as npm run lint or npm run pack, as a defect or test gap.\n\nProfile focus: ${focus}`,
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
  'Review all supplied implementation, test, and documentation content from every angle in one consolidated report. Report all actionable findings, including P0, P1, P2, and P3; P2 and P3 findings must be reported but must not affect the verdict. Never report a documentation issue unless there is a concrete contradiction or unsupported claim; if your analysis says no discrepancy exists, emit the exact Documentation placeholder instead. A statement that no discrepancy exists is never an issue. Do not demand subprocess integration tests when focused injected-executor tests are explicitly marked as the complete contract for delegated runtime behavior. Every issue category array must contain at least one item; when empty, emit one P3 placeholder with location `none`, issue `No issues found.`, and empty `ignore_example`. Group findings under these headings, in exactly this order: Correctness, Security, Reliability, Performance, Architecture, API Design, Tests, Documentation. Assign each underlying issue to one best-fit category only; do not duplicate the same issue across categories. Honor all global ignore rules and apply the global pass/block criteria.',
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
          text: 'Final completeness rule: in this single turn, call exactly one submit_review tool and exactly one submit_suggestions tool in parallel; do not call either tool sequentially or more than once. List every concrete finding supported by the supplied input. AGENTS.md handoff instructions are not validation evidence: do not demand or report absent npm lint, npm pack, signal-cancellation, or other external evidence that was not supplied. Do not report absence of those commands as a test gap. Do not demand every profile cross-product when representative focused tests cover the shared implementation. If a category has no concrete finding, emit only its exact no-issues placeholder; a statement that no contradiction or issue was found is never itself a finding. The documented --usage forms are supported; do not invent a command-parser discrepancy. Treat nearby codescope ignore comments as authoritative.',
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
  implementationOnlyPrompt(
    `Identify implementation issues only at priorities P0 through P${maximum}; omit lower priorities.`,
  );
export const createAnalysisPrompt = (subject) =>
  profilePrompt(
    `${subject} Report each issue as one concise bullet, grouped by priority P0, P1, P2, etc., with the affected path and related line number(s).`,
  );
