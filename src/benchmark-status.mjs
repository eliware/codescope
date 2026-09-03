export function benchmarkExitCode(results, expectedCount) {
  if (!Array.isArray(results) || results.length !== expectedCount) return 1;
  return results.every((result) => result?.code === 0 && !result.signal) ? 0 : 1;
}
