import { createReviewTool, createSuggestionTool, profilePrompt, REVIEW_CATEGORIES, SUGGESTION_CATEGORIES } from '../src/prompt.mjs';
import { getProfile } from '../src/cli-profiles.mjs';

test('builds strict tools with complete category sets', () => {
  expect(createReviewTool().strict).toBe(true);
  expect(Object.keys(createReviewTool().parameters.properties.issues.properties)).toEqual(REVIEW_CATEGORIES);
  expect(Object.keys(createSuggestionTool().parameters.properties.suggestions.properties)).toEqual(SUGGESTION_CATEGORIES);
});

test('defines all-profile review behavior and shared priorities', () => {
  const all = getProfileText();
  expect(all).toMatch(/CodeScope finding priorities/);
  expect(all).toMatch(/P2 findings must not change the overall verdict/);
  expect(all).toMatch(/validation-integrity/);
  expect(all).toMatch(/A passing command does not prove/);
  expect(all).toMatch(/Return `block` only when/);
});

test('scopes review and suggestion tools by profile', () => {
  const all = getProfile('all', 'review').prompt;
  expect(all.tools.map((tool) => tool.name)).toEqual(['submit_review', 'submit_suggestions']);
  expect(all.parallel_tool_calls).toBe(true);
  expect(getProfile('security', 'review').prompt.tools[0].parameters.properties.issues.required).toEqual(['security']);
  expect(getProfile('architecture', 'review').prompt.tools[0].parameters.properties.issues.required).toEqual(['architecture']);
  expect(getProfile('new-features', 'suggest').prompt.tools[0].parameters.properties.suggestions.required).toEqual(['new-features']);
  expect(getProfile('security', 'suggest').prompt.tools[0].parameters.properties.suggestions.required).toEqual(['security', 'new-features']);
  expect(getProfile('all', 'suggest').prompt.tools[0].parameters.properties.suggestions.required).toContain('new-features');
});

test('preserves non-text prompt parts', () => {
  const prompt = profilePrompt('test focus');
  prompt.input[1].content.push({ type: 'input_image', image_url: 'data:image/png;base64,x' });
  expect(prompt.input[1].content[1]).toEqual({ type: 'input_image', image_url: 'data:image/png;base64,x' });
});

function getProfileText() {
  return getProfile('architecture').prompt.input[1].content[0].text;
}
