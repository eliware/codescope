import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { writeBenchmarkSummary } from '../../src/benchmark/summary-writer.mjs';

test('writes a benchmark summary file', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'codescope-summary-writer-'));
  const file = path.join(directory, 'summary.json');
  await writeBenchmarkSummary(file, {
    cwd: directory,
    npmTest: { code: 0, elapsedMs: 1 },
    model: 'gpt-5.6-luna',
    pricing: {},
    efforts: ['none'],
    results: [],
    logs: directory,
  });
  expect(JSON.parse(await readFile(file, 'utf8')).status).toBe('incomplete');
});
