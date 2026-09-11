import { validateSummaryEfforts } from '../../src/benchmark/summary-validation.mjs';

test('identifies duplicate and incomplete benchmark efforts', () => {
  const result = validateSummaryEfforts([{ effort: 'none' }, { effort: 'none' }], ['none', 'low']);
  expect(result.duplicateEfforts).toEqual(['none']);
  expect(result.hasExactEfforts).toBe(false);
});
