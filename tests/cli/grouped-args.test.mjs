import { parseGroupedArgs } from '../../src/cli/grouped-args.mjs';

test('parses grouped review and suggestion commands', () => {
  expect(parseGroupedArgs('review', ['all', '--usage'])).toMatchObject({
    command: 'analyze-all',
    mode: 'review',
    option: '--usage',
  });
  expect(parseGroupedArgs('suggest', ['new-features', '--effort=low'])).toMatchObject({
    command: 'analyze-new-features',
    mode: 'suggest',
    effort: 'low',
  });
});

test('rejects invalid grouped command shapes', () => {
  expect(() => parseGroupedArgs('review', [])).toThrow(/Usage/);
  expect(() => parseGroupedArgs('review', ['--dry-run', 'all'])).toThrow(/Profile must precede/);
  expect(() => parseGroupedArgs('review', ['missing'])).toThrow(/Unknown command profile/);
  expect(() => parseGroupedArgs('review', ['new-features'])).toThrow(/suggestion-only/);
  expect(() => parseGroupedArgs('review', ['all', '--bad'])).toThrow(/Usage/);
  expect(() => parseGroupedArgs('review', ['all', '--usage', '--usage'])).toThrow(/Usage/);
});
