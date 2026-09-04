import { parseArgs } from '../../src/cli/args.mjs';

test('parses grouped review options', () => {
  expect(parseArgs(['review', 'all', '--effort=low'])).toMatchObject({
    command: 'analyze-all',
    mode: 'review',
    effort: 'low',
  });
});
