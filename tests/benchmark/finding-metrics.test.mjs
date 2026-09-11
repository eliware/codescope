import { findingCounts } from '../../src/benchmark/finding-metrics.mjs';

test('counts actionable findings and suggestions', () => {
  expect(findingCounts({ issues: { security: [{ issue: 'x' }] }, suggestions: {} })).toEqual({
    issues: 1,
    suggestions: 0,
  });
});

test('handles missing groups and sentinel items', () => {
  expect(findingCounts({ issues: { security: [{ issue: 'No issues found.' }] } })).toEqual({
    issues: 0,
    suggestions: 0,
  });
});

test('counts unified findings', () => {
  expect(findingCounts({ findings: { security: [{ finding: 'x' }] } })).toMatchObject({
    issues: 1,
  });
});
