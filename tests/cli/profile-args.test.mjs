import { parseProfileArgs } from '../../src/cli/profile-args.mjs';

test('parses direct profile options', () => {
  expect(parseProfileArgs('all', ['--usage'])).toEqual({
    command: 'analyze-all',
    option: '--usage',
    testTimeout: undefined,
    effort: undefined,
    model: undefined,
  });
  expect(parseProfileArgs('architecture', ['--test-timeout', '15'])).toMatchObject({
    command: 'analyze-architecture',
    testTimeout: '15',
  });
});

test('rejects invalid direct profile options', () => {
  expect(() => parseProfileArgs('missing', [])).toThrow(/Unknown command/);
  expect(() => parseProfileArgs('all', ['--version'])).toThrow(/not valid/);
  expect(() => parseProfileArgs('all', ['--bad'])).toThrow(/Unexpected/);
});
