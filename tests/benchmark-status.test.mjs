import { benchmarkExitCode } from '../src/benchmark-status.mjs';

test('returns success only when every expected benchmark completes cleanly', () => {
  expect(benchmarkExitCode([{ code: 0 }], 1)).toBe(0);
  expect(benchmarkExitCode([{ code: 1 }], 1)).toBe(1);
  expect(benchmarkExitCode([{ code: 0, signal: 'SIGTERM' }], 1)).toBe(1);
  expect(benchmarkExitCode([], 1)).toBe(1);
});
