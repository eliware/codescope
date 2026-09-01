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

export const createAnalysisPrompt = (subject) => ({
  ...prompt,
  input: [
    { role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] },
    { role: 'user', content: [{ type: 'input_text', text: `Review ${subject}. List each issue one bullet per line, grouped by priority P0, P1, P2, etc. Include path and line number(s). Honor inline comments marking intentional policies. Be extremely concise; sacrifice grammar for brevity.` }] },
  ],
});
