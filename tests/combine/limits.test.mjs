import { addBatchLength, assertWithinLimit, getBatchSize } from '../../src/combine/limits.mjs';

test('keeps reads bounded by configured concurrency for every limit mode', () => {
  expect(getBatchSize(4)).toBe(4);
});

test('accounts for separators between sections and batches', () => {
  expect(addBatchLength(0, 10, 2)).toBe(11);
  expect(addBatchLength(11, 20, 1)).toBe(32);
});

test('rejects only totals above the configured limit', () => {
  expect(() => assertWithinLimit(10, 10)).not.toThrow();
  expect(() => assertWithinLimit(11, 10)).toThrow(/10-character/);
});
