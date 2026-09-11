import { normalizeExecutionResult, resolveResultCode } from '../../src/review/execution-result.mjs';

test('normalizes default and injected execution statuses', () => {
  expect(normalizeExecutionResult({}, true).code).toBe(0);
  expect(normalizeExecutionResult({}, false).code).toBe('unknown');
  expect(normalizeExecutionResult({ code: 2 }, false).code).toBe(2);
  expect(resolveResultCode({ code: null })).toBe('unknown');
});
