import { mergeLeadingOptions } from '../../../src/cli/args/merge-leading-options.mjs';

test('merges leading options into the parsed command', () => {
  expect(mergeLeadingOptions({ command: 'all' }, {
    effort: 'medium', model: undefined, dryRun: false, usageCount: 0, add: ['note'],
  })).toMatchObject({ effort: 'medium', add: ['note'] });
});
