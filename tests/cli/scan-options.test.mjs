import { scanOptionTokens } from '../../src/cli/scan-options.mjs';

test('scans repeatable additions and scalar options', () => {
  expect(scanOptionTokens(['-a', 'one', '--model=gpt-5.6-sol', '--usage'])).toMatchObject({
    add: ['one'],
    model: ['--model=gpt-5.6-sol'],
    usage: 1,
  });
});
