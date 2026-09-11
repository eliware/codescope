import { parseTimeoutOption } from '../../src/cli/timeout-options.mjs';

test('parses a positive test timeout', () => {
  expect(parseTimeoutOption(['--test-timeout', '30'])).toEqual({
    testTimeout: '30',
    remaining: [],
  });
});
