import { mergeLeadingOptions } from '../../../src/cli/args/merge-leading-options.mjs';

test('merges leading options into the parsed command', () => {
  expect(mergeLeadingOptions({ command: 'all' }, {
    effort: 'medium', model: undefined, dryRun: false, usageCount: 0, add: ['note'],
  })).toMatchObject({ effort: 'medium', add: ['note'] });
});

test('rejects duplicate and incompatible leading options', () => {
  const parsed = { command: 'all', effort: 'high', model: 'model', dryRun: true, usage: true };
  expect(() => mergeLeadingOptions(parsed, { effort: 'low', model: undefined, dryRun: false, usageCount: 0, add: [] })).toThrow(/effort/);
  expect(() => mergeLeadingOptions(parsed, { effort: undefined, model: 'other', dryRun: false, usageCount: 0, add: [] })).toThrow(/model/);
  expect(() => mergeLeadingOptions(parsed, { effort: undefined, model: undefined, dryRun: true, usageCount: 0, add: [] })).toThrow(/dry-run/);
  expect(() => mergeLeadingOptions(parsed, { effort: undefined, model: undefined, dryRun: false, usageCount: 1, add: [] })).toThrow(/usage/);
  expect(() => mergeLeadingOptions({ command: 'prompt' }, { effort: undefined, model: undefined, dryRun: true, usageCount: 0, add: [] })).toThrow(/Usage/);
});

test('uses parsed values when leading values are absent', () => {
  expect(mergeLeadingOptions({ command: 'all', effort: 'high', model: 'model', dryRun: true, usage: true }, {
    effort: undefined, model: undefined, dryRun: false, usageCount: 0, add: ['later'],
  })).toMatchObject({ effort: 'high', model: 'model', dryRun: true, usage: true, add: ['later'] });
});
