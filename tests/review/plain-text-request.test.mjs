import { preparePlainTextRequest } from '../../src/review/plain-text-request.mjs';

test('rejects a blank custom prompt', () => {
  expect(() => preparePlainTextRequest({}, '  ', 'source')).toThrow(/non-empty/);
});

test('prepares a custom prompt without review tools', () => {
  const request = preparePlainTextRequest(
    { tool_choice: 'required', parallel_tool_calls: true },
    'prompt',
    'context',
  );
  expect(request.tools).toEqual([]);
  expect(request.input[0].content[0].text).toContain('prompt');
});
