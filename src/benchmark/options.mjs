import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API_PRICING } from '../pricing.mjs';

export const BENCHMARK_EFFORTS = ['none', 'low', 'medium', 'high'];

export function resolveBenchmarkOptions(args, cwd) {
  const model =
    args.find((value) => value.startsWith('--model='))?.slice('--model='.length) ?? 'gpt-5.6-luna';
  if (!Object.hasOwn(API_PRICING, model))
    throw new Error(`Model must be one of: ${Object.keys(API_PRICING).join(', ')}`);
  const scriptDirectory = dirname(fileURLToPath(import.meta.url));
  const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const logDirectory = resolve(cwd, 'benchmark-results', `effort-${stamp}`);
  return {
    cwd,
    model,
    pricing: API_PRICING[model],
    efforts: BENCHMARK_EFFORTS,
    executable: resolve(scriptDirectory, '..', '..', 'bin', 'codescope.mjs'),
    logDirectory,
    summaryPath: resolve(logDirectory, 'summary.json'),
  };
}
