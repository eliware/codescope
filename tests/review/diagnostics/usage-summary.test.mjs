import { readUsageSummary } from '../../../src/review/diagnostics/usage-summary.mjs';

test('projects provider usage diagnostics', () => {
  expect(readUsageSummary({ usage: { input_tokens: 2 } })).toEqual({ input_tokens: 2 });
  expect(readUsageSummary({})).toBeUndefined();
});
