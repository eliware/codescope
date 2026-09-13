import { parseProfileArgs } from '../../src/cli/profile-args.mjs';

test('parses direct profile options', () => {
  expect(parseProfileArgs('all', ['--usage'])).toEqual({
    command: 'analyze-all',
    option: '--usage',
    effort: undefined,
    model: undefined,
  });
  expect(parseProfileArgs('architecture', [])).toMatchObject({ command: 'analyze-architecture' });
});

test('rejects invalid direct profile options', () => {
  expect(() => parseProfileArgs('missing', [])).toThrow(/Unknown command/);
  expect(() => parseProfileArgs('all', ['--version'])).toThrow(/not valid/);
  expect(() => parseProfileArgs('all', ['--bad'])).toThrow(/Unexpected/);
});
