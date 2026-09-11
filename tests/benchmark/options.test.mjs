import { resolveBenchmarkOptions } from '../../src/benchmark/options.mjs';

test('resolves benchmark model and paths', () => {
  const options = resolveBenchmarkOptions(['--model=gpt-5.6-luna'], 'C:/repo');
  expect(options.model).toBe('gpt-5.6-luna');
  expect(options.efforts).toEqual(['none', 'low', 'medium', 'high']);
  expect(options.summaryPath).toContain('summary.json');
});

test('uses the default model and rejects unsupported models', () => {
  expect(resolveBenchmarkOptions([], 'C:/repo').model).toBe('gpt-5.6-luna');
  expect(() => resolveBenchmarkOptions(['--model=unknown'], 'C:/repo')).toThrow('Model must be one of');
});
