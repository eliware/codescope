import { getPromptSource, createGenericSuggestionPrompt } from '../../src/profiles/prompt-sources.mjs';

test('owns profile prompt-source registration', () => {
  expect(getPromptSource('architecture')).toEqual(expect.objectContaining({ input: expect.any(Array) }));
  expect(getPromptSource('missing')).toBeUndefined();
});

test('creates the generic suggestion prompt at the source boundary', () => {
  expect(createGenericSuggestionPrompt('architecture')).toEqual(expect.any(Object));
});
