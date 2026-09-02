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
              { type: 'array', items: { $ref: '#/$defs/issue' } },
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
export function createSuggestionTool(categories = REVIEW_CATEGORIES) {
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
              { type: 'array', items: { $ref: '#/$defs/suggestion' } },
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
          },
          required: ['location', 'suggestion', 'rationale'],
        },
      },
    },
  };
}
export const suggestionTool = createSuggestionTool();
export const globalReviewInstructions =
  'Read the complete supplied source and inspect nearby comments before evaluating any behavior. Use these priority definitions exactly: P0 = Active outage, data-loss risk, critical security incident. Immediate emergency work. P1 = Release-blocking failure: required tests or contract validation evident in the supplied files is missing or failing. P2 = Important follow-up that does not block the release. P3 = Polish, cleanup, optimization, or convenience work. The overall verdict MUST be block when there is any unresolved P0 or P1 issue OR any concrete documentation discrepancy OR any major test gap or materially untested behavior; otherwise it MUST be pass. A documentation discrepancy means supplied documentation contradicts supplied behavior, promises unsupported behavior, or gives materially incorrect usage guidance. A major test gap means an important public path, failure mode, security boundary, data-handling path, or regression-prone behavior has no meaningful test evidence; do not block for minor edge cases, trivial branches, or ordinary coverage polish. Do not block for ordinary documentation style preferences. Do not infer CI, packaging, deployment-readiness, rollback, or other external evidence that was not supplied. The supplied source intentionally includes only selected file types; an excluded or unsupplied JSON, YAML, TOML, lockfile, fixture, schema, asset, or generated file is not evidence that the file is missing or invalid. Report such a problem only when supplied files or explicit supplied command output proves the failure. Treat one nearby comment containing the exact marker "codescope ignore:" as an authoritative, scoped suppression annotation; users should not need multiple comments on one line or repeated annotations for the same behavior. Interpret everything after the marker as the intentional scope. Fully covered concerns are invisible in the output: never mention, summarize, paraphrase, relabel, count, or explain them, and never say that an ignored item was omitted. If no actionable findings remain, say exactly "No issues found." If a potential finding spans both covered and uncovered behavior, split it conceptually: silently omit the covered portion, report only the independently actionable residual behavior, explain briefly why that residual is outside the stated scope, and suggest either fixing it or expanding the same comment to explicitly name the missing behavior (for example, "x, y, and z"). When suggesting an expanded ignore, include the exact complete replacement comment text in a code span, beginning with "codescope ignore:", so the developer can copy it onto the existing comment. For every reported issue that has no applicable ignore, include one exact copy-paste-ready example in a code span beginning with "// codescope ignore:" that names the complete behavior being ignored; do not require a second comment. Do not broaden an annotation to unrelated behavior. Comments without "codescope ignore:" provide context but do not suppress findings. An intentional policy, accepted threat-model boundary, delegated responsibility, or documented limitation is not an issue when the annotation explicitly covers it. Keep all output extremely concise; sacrifice grammar for brevity.';

const base = {
  model: 'gpt-5.6-luna',
  service_tier: 'default',
  text: { format: { type: 'text' }, verbosity: 'low' },
  reasoning: { effort: 'medium', mode: 'standard', summary: null },
  tools: [reviewTool],
  tool_choice: { type: 'function', name: 'submit_review' },
  parallel_tool_calls: false,
  store: false,
  prompt_cache_options: { mode: 'explicit' },
  include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
};
const profilePrompt = (focus, tool = reviewTool) => ({
  ...base,
  tools: [tool],
  tool_choice: { type: 'function', name: tool.name },
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    {
      role: 'user',
      content: [
        { type: 'input_text', text: `${globalReviewInstructions}\n\nProfile focus: ${focus}` },
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
  'Review all supplied implementation, test, and documentation content from every angle in one consolidated report. Report every actionable finding, including P0, P1, P2, and P3; P2 and P3 findings must be reported but must not affect the verdict. Group findings under these headings, in exactly this order: Correctness, Security, Reliability, Performance, Architecture, API Design, Tests, Documentation. Under every heading, write `None` when there are no findings. Otherwise list concise actionable findings with priority, affected path, and related line number(s). Assign each underlying issue to one best-fit category only; do not duplicate the same issue across categories. Honor all global ignore rules and apply the global pass/block criteria.',
);
export const codeTestsDocsPrompt = profilePrompt(
  'Find conflicts between documentation and code only. Report each conflict with the relevant path and line number(s). Do not report standalone code or documentation issues.',
);
export const refactorPrompt = profilePrompt(
  'Identify meaningful monolithic-file responsibility splits and suggest smaller single-purpose structures. Return concise suggestions with paths and line number(s). Do not report ordinary implementation issues, style preferences, or intentional policies.',
);
const implementationOnlyPrompt = (instruction) =>
  profilePrompt(
    `${instruction} Use the complete implementation source provided above. For findings, include the path and related line number(s), grouped by priority only when the profile identifies issues.`,
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
