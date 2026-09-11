import { writeFile } from 'node:fs/promises';
import { assembleBenchmarkSummary } from './summary-assembly.mjs';

export async function writeBenchmarkSummary(
  path,
  { cwd, npmTest, model, pricing, efforts, results, logs },
) {
  const summary = assembleBenchmarkSummary({
    cwd,
    npmTest,
    model,
    pricing,
    efforts,
    results,
    logs,
  });
  await writeFile(path, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
}
