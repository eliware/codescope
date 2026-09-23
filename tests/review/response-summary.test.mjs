import { summarizeProviderResponse } from '../../src/review/response-summary.mjs';

test('summarizes provider output text and function calls', () => {
  expect(summarizeProviderResponse({
    output_text: 'done',
    output: [{ type: 'function_call', name: 'review', arguments: '{"ok":true}' }],
  })).toMatchObject({ output_text: 'done', function_call_arguments: [{ name: 'review' }] });
});
