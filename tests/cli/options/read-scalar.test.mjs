import { readScalar } from '../../../src/cli/options/read-scalar.mjs';

test('reads separated and equals-form scalar values', () => {
  expect(readScalar(['--effort', 'low'], 0)).toEqual({ kind: 'effort', normalized: '--effort=low', nextIndex: 1 });
  expect(readScalar(['--model=gpt-5.6-sol'], 0)).toEqual({ kind: 'model', normalized: '--model=gpt-5.6-sol', nextIndex: 0 });
});
