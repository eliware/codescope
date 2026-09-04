import { benchmarkExitCode } from '../src/benchmark-status.mjs';

test('re-exports benchmark status behavior', () => {
  expect(benchmarkExitCode([{ code: 0 }], 1)).toBe(0);
});
