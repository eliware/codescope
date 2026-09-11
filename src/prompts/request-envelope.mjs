import { reviewTool } from './tool-schemas.mjs';

export const baseRequest = {
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
