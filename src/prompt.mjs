// These defaults are product policy: Luna keeps review cost low, while reasoning and source metadata aid diagnosis.
export const defaultDeveloperText = 'Review the following JavaScript source files and identify actionable issues:\n\n';
export const prompt = {
  model: 'gpt-5.6-luna',
  service_tier: 'default',
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: 'List every issue as one bullet per line, grouped by priority P0, P1, P2, etc. When naming an issue, include its file path and related line number(s) in the response. Honor inline comments explaining intentional policies; do not report behavior explicitly marked intentional as an issue. Be extremely concise; sacrifice grammar for brevity.' }] },
  ],
  text: { format: { type: 'text' }, verbosity: 'low' },
  reasoning: { effort: 'none', mode: 'standard', summary: null },
  tools: [],
  store: false,
  prompt_cache_options: { mode: 'explicit' },
  include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
};

export const mdPrompt = {
  ...prompt,
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: 'Find documentation inconsistencies. List each one bullet per line, grouped by priority P0, P1, P2, etc. Include path and line number(s). Be extremely concise; sacrifice grammar for brevity.' }] },
  ],
};

export const allPrompt = {
  ...prompt,
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: 'Find conflicts between the documentation and the code. Report only doc/code inconsistencies, not standalone code issues or standalone documentation issues. List each one bullet per line, grouped by priority P0, P1, P2, etc. Include path and line number(s). Be extremely concise; sacrifice grammar for brevity.' }] },
  ],
};

export const refactorPrompt = {
  ...prompt,
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: 'Identify monolithic files with mixed scopes or responsibilities. Report only meaningful refactoring opportunities, not style preferences or intentional policies. For each issue, include the file path and related line number(s), explain the responsibility split, and suggest a smaller single-purpose file/folder structure that improves maintainability and testability. Group by priority P0, P1, P2, etc., one bullet per line. Be extremely concise; sacrifice grammar for brevity.' }] },
  ],
};

const implementationOnlyPrompt = (instruction) => ({
  ...prompt,
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: `${instruction} Use the complete implementation source provided above. Include file path and related line number(s) where relevant. Honor inline comments marking intentional policies. Be extremely concise; sacrifice grammar for brevity.` }] },
  ],
});

export const architecturePrompt = implementationOnlyPrompt('Suggest architecture optimizations only: identify high-value improvements to module boundaries, dependencies, data flow, scalability, reliability, and maintainability. Do not report ordinary code defects, style issues, or documentation issues.');
export const newFeaturesPrompt = implementationOnlyPrompt('Suggest valuable new features only: infer practical capabilities that would improve this tool for users. Do not report defects, refactoring tasks, style issues, or documentation issues. For each suggestion, briefly state user value and likely implementation area.');
export const securityPrompt = implementationOnlyPrompt('Identify security risks only: secrets, unsafe input, injection, permissions, trust boundaries, and data exposure.');
export const performancePrompt = implementationOnlyPrompt('Identify performance risks only: unnecessary I/O, CPU cost, memory growth, latency, and scalability bottlenecks.');
export const reliabilityPrompt = implementationOnlyPrompt('Identify reliability risks only: failure handling, retries, cancellation, cleanup, and incomplete or corrupted state.');
export const apiDesignPrompt = implementationOnlyPrompt('Suggest API design improvements only: public interfaces, validation, consistency, and extensibility.');
export const dependenciesPrompt = implementationOnlyPrompt('Suggest dependency improvements only: unnecessary packages, risky coupling, unused dependencies, and dependency boundaries.');
export const observabilityPrompt = implementationOnlyPrompt('Suggest observability improvements only: logging, diagnostics, actionable errors, and operational visibility.');
export const accessibilityPrompt = implementationOnlyPrompt('Suggest accessibility improvements only for user-facing terminal or UI behavior. Do not report unrelated code issues.');
export const releasePrompt = implementationOnlyPrompt('Identify release and packaging improvements only: entrypoints, metadata, versioning, installation, and distribution.');
export const quickWinsPrompt = implementationOnlyPrompt('Suggest only high-value, low-effort improvements. Exclude speculative, stylistic, or large refactoring work.');
export const prioritizePrompt = implementationOnlyPrompt('Prioritize existing improvement opportunities only by impact, effort, and recommended order. Do not invent unrelated issues.');

export const createAnalysisPrompt = (subject) => ({
  ...prompt,
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: `Review ${subject}. List each issue one bullet per line, grouped by priority P0, P1, P2, etc. Include path and line number(s). Honor inline comments marking intentional policies. Be extremely concise; sacrifice grammar for brevity.` }] },
  ],
});
