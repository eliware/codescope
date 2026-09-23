import { parseOptionValues } from '../../../src/cli/options/parse-values.mjs';

test('normalizes scalar and repeatable options', () => {
  expect(parseOptionValues(['--effort=medium', '--add', 'note'])).toMatchObject({
    effort: 'medium',
    add: ['note'],
  });
});
