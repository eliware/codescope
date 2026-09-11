import { normalizeExecutionResult, resolveResultCode } from '../../src/review/execution-result.mjs';

test('normalizes missing execution statuses as unknown', () => {
  expect(normalizeExecutionResult({}, true).code).toBe('unknown');
  expect(normalizeExecutionResult({}, false).code).toBe('unknown');
  expect(normalizeExecutionResult({ code: 2 }, false).code).toBe(2);
  expect(resolveResultCode({ code: null })).toBe('unknown');
});
