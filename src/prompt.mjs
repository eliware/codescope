// Shared review policy is combined with a small profile-specific focus below.
export const defaultDeveloperText = 'Review the following JavaScript source files and identify actionable issues:\n\n';
export const globalReviewInstructions = 'List each issue as one bullet per line, grouped by priority P0, P1, P2, etc. Include file path and related line number(s). Inspect nearby comments first: inline comments authoritatively explain intentional behavior or policy, so do not report behavior they explain. This is hard false-positive suppression, not context. Example: organization-only GHCR support comments suppress personal-account support findings. Be extremely concise; sacrifice grammar for brevity.';
// Intentional deployment policy: pin the tested low-cost model so every profile has predictable availability/cost.
const base = { model: 'gpt-5.6-luna', service_tier: 'default', text: { format: { type: 'text' }, verbosity: 'low' }, reasoning: { effort: 'none', mode: 'standard', summary: null }, tools: [], store: false, prompt_cache_options: { mode: 'explicit' }, include: ['reasoning.encrypted_content', 'web_search_call.action.sources'] };
const profilePrompt = focus => ({ ...base, input: [{ role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] }, { role: 'user', content: [{ type: 'input_text', text: `${globalReviewInstructions}\n\nProfile focus: ${focus}` }] }] });
export const prompt = profilePrompt('review selected source files for actionable implementation issues.');
export const mdPrompt = profilePrompt('find documentation inconsistencies only.');
export const allPrompt = profilePrompt('find conflicts between documentation and code only; do not report standalone code or documentation issues.');
export const refactorPrompt = profilePrompt('identify meaningful monolithic-file responsibility splits and suggest smaller single-purpose structures; do not report style preferences or intentional policies.');
const implementationOnlyPrompt = instruction => profilePrompt(`${instruction} Use the complete implementation source provided above.`);
export const architecturePrompt = implementationOnlyPrompt('Suggest architecture optimizations only.');
export const newFeaturesPrompt = implementationOnlyPrompt('Suggest valuable new features only, including user value and likely implementation area.');
export const securityPrompt = implementationOnlyPrompt('Identify security risks only.');
export const performancePrompt = implementationOnlyPrompt('Identify performance risks only.');
export const reliabilityPrompt = implementationOnlyPrompt('Identify reliability risks only.');
export const apiDesignPrompt = implementationOnlyPrompt('Suggest API design improvements only.');
export const dependenciesPrompt = implementationOnlyPrompt('Suggest dependency improvements only.');
export const observabilityPrompt = implementationOnlyPrompt('Suggest observability improvements only.');
export const accessibilityPrompt = implementationOnlyPrompt('Suggest accessibility improvements only for user-facing behavior.');
export const releasePrompt = profilePrompt('Act as a release-readiness gate for the complete implementation source. Output exactly one verdict: `pass`, `pass with known issues`, or `block release`. Use `block release` only for findings that affect correctness, security, reliability, or user data. Use `pass with known issues` for lower-risk findings. Do not block for behavior explicitly documented as an intentional policy or threat-model limitation, including immediate streaming of partial output before a later provider failure or portable lstat/read race limitations. Ignore purely stylistic, cosmetic, speculative, and convenience suggestions. After the verdict, add at most three ultra-concise bullets naming only release-blocking or materially relevant known issues, with path and line number(s).');
export const quickWinsPrompt = implementationOnlyPrompt('Suggest only high-value, low-effort improvements.');
export const prioritizePrompt = implementationOnlyPrompt('Prioritize existing improvement opportunities only.');
export const priorityPrompt = maximum => implementationOnlyPrompt(`Identify implementation issues only at priorities P0 through P${maximum}; omit lower priorities.`);
export const createAnalysisPrompt = subject => profilePrompt(subject);
