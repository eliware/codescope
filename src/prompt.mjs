export const defaultDeveloperText =
  'Review the following JavaScript source files and identify actionable issues:\n\n';
export const reviewTool = {
  type: 'function',
  name: 'submit_review',
  description: 'Return the complete Codescope review result.',
  strict: true,
  parameters: {
    type: 'object',
    additionalProperties: false,
    properties: {
      issues: {
        type: 'array',
        items: {
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
      verdict: { type: 'string', enum: ['pass', 'block'] },
    },
    required: ['issues', 'verdict'],
  },
};
export const globalReviewInstructions =
  'Read the complete supplied source and inspect nearby comments before evaluating any behavior. Use these priority definitions exactly: P0 = Active outage, data-loss risk, critical security incident. Immediate emergency work. P1 = Release-blocking failure: required tests or contract validation evident in the supplied files is missing or failing. P2 = Important follow-up that does not block the release. P3 = Polish, cleanup, optimization, or convenience work. Do not infer CI, packaging, deployment-readiness, rollback, or other external evidence that was not supplied. Treat one nearby comment containing the exact marker "codescope ignore:" as an authoritative, scoped suppression annotation; users should not need multiple comments on one line or repeated annotations for the same behavior. Interpret everything after the marker as the intentional scope. Fully covered concerns are invisible in the output: never mention, summarize, paraphrase, relabel, count, or explain them, and never say that an ignored item was omitted. If no actionable findings remain, say exactly "No issues found." If a potential finding spans both covered and uncovered behavior, split it conceptually: silently omit the covered portion, report only the independently actionable residual behavior, explain briefly why that residual is outside the stated scope, and suggest either fixing it or expanding the same comment to explicitly name the missing behavior (for example, "x, y, and z"). When suggesting an expanded ignore, include the exact complete replacement comment text in a code span, beginning with "codescope ignore:", so the developer can copy it onto the existing comment. For every reported issue that has no applicable ignore, include one exact copy-paste-ready example in a code span beginning with "// codescope ignore:" that names the complete behavior being ignored; do not require a second comment. Do not broaden an annotation to unrelated behavior. Comments without "codescope ignore:" provide context but do not suppress findings. An intentional policy, accepted threat-model boundary, delegated responsibility, or documented limitation is not an issue when the annotation explicitly covers it. Keep all output extremely concise; sacrifice grammar for brevity.';

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
const profilePrompt = (focus) => ({
  ...base,
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
  'Review all supplied implementation, test, and documentation content from every angle in one consolidated report. Group findings under these headings, in exactly this order: Correctness, Security, Reliability, Performance, Architecture, API Design, Tests, Documentation. Under every heading, write `None` when there are no findings. Otherwise list concise actionable findings with priority, affected path, and related line number(s). Assign each underlying issue to one best-fit category only; do not duplicate the same issue across categories. Honor all global ignore rules.',
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
export const releasePrompt = profilePrompt(
  'Act as a release-readiness gate for the complete implementation source. Output exactly one verdict: `pass`, `pass with known issues`, or `block release`. Use `block release` only when there is a concrete, unresolved finding that affects correctness, security, reliability, or user data in the supported product threat model. If no such concrete blocker remains, you MUST NOT output `block release`: output `pass` when no materially relevant issues remain, otherwise output `pass with known issues`. Treat findings fully covered by a nearby `codescope ignore:` comment as resolved and do not count them as known issues. For partially covered findings, count only the explicitly uncovered residual behavior. Do not block for intentional policy or threat-model boundaries, application-owned limits in generic libraries, or documented portability limitations. Ignore purely stylistic, cosmetic, speculative, and convenience suggestions. After the verdict, add at most three ultra-concise bullets naming only materially relevant known issues, with path and line number(s).',
);
export const quickWinsPrompt = implementationOnlyPrompt(
  'Suggest only high-value, low-effort improvements.',
);
export const strictReleasePrompt = profilePrompt(
  'Act as an exhaustive release-readiness gate for all supplied implementation, test, and Markdown content. Review the code, tests, and documentation together for every concrete P0 or P1 release blocker, including correctness, security, reliability, user-data, API/contract, test/regression, and documentation consistency risks. Ignore P2 and P3 findings completely. The supplied files are the entire evidence set: do not infer current runtime state or external evidence. Absence of validation results is not a blocker. Build an internal inventory of ALL distinct P0/P1 blockers before calling submit_review; do not stop after the first blocker, return a small batch, or defer blockers. Mentally resolve each finding and continue scanning for blockers that would then surface. Call submit_review exactly once with every blocker, including path:line location, concise issue, and copy-paste-ready ignore_example. Put the complete blocker inventory in the issues array before the verdict field; the verdict is last. Set verdict to `block` only when at least one concrete P0/P1 blocker remains; otherwise set verdict to `pass`.',
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
