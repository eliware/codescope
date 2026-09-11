export function parseBenchmarkOutput(output) {
  try {
    const report = JSON.parse(output.trim());
    if (
      !report ||
      typeof report !== 'object' ||
      Array.isArray(report) ||
      (!('findings' in report) && !('issues' in report) && !('suggestions' in report))
    )
      return undefined;
    return report;
  } catch {
    return undefined;
  }
}
