import { scanOptionTokens } from '../../src/cli/scan-options.mjs';

test('scans repeatable additions and scalar options', () => {
  expect(scanOptionTokens(['-a', 'one', '--model=gpt-5.6-sol', '--usage'])).toMatchObject({
    add: ['one'],
    model: ['--model=gpt-5.6-sol'],
    usage: 1,
  });
});

test('keeps equals-form scalar options when requested', () => {
  expect(scanOptionTokens(['--effort=low', '--model=gpt-5.6-sol'], { keepScalarOptions: true }))
    .toMatchObject({ remaining: ['--effort=low', '--model=gpt-5.6-sol'] });
});

test('drops scalar options from remaining tokens unless requested', () => {
  expect(scanOptionTokens(['--effort', 'low', '--model', 'gpt-5.6-sol', '--effort=medium', '--model=gpt-5.6-luna']))
    .toMatchObject({ remaining: [], effort: ['--effort=low', '--effort=medium'], model: ['--model=gpt-5.6-sol', '--model=gpt-5.6-luna'] });
});

test('drops dry-run and keeps usage only in the normal scan mode', () => {
  expect(scanOptionTokens(['--dry-run', '--usage', 'text']))
    .toMatchObject({ dryRun: 1, usage: 1, remaining: ['--usage', 'text'] });
});

test('scans separated values and preserves allowed scalar options', () => {
  expect(scanOptionTokens([
    '--effort', 'low', '--model', 'gpt-5.6-luna', '--dry-run', '--usage', '--add', 'note', 'text',
  ], { keepScalarOptions: true })).toMatchObject({
    effort: ['--effort=low'], model: ['--model=gpt-5.6-luna'], dryRun: 1, usage: 1,
    add: ['note'], remaining: ['--effort=low', '--model=gpt-5.6-luna', '--dry-run', '--usage', 'text'],
  });
});

test('rejects missing option values', () => {
  expect(() => scanOptionTokens(['--add'])).toThrow(/requires/);
  expect(() => scanOptionTokens(['--effort'])).toThrow(/requires/);
  expect(() => scanOptionTokens(['--model', '--dry-run'])).toThrow(/requires/);
  expect(() => scanOptionTokens(['--add', '   '])).toThrow(/requires/);
});

test('scans leading options and collects trailing additions', () => {
  expect(scanOptionTokens(['--effort=low', 'all', '--add', 'later'], { leadingOnly: true }))
    .toMatchObject({ effort: ['--effort=low'], add: ['later'], consumed: 1, remaining: ['all', '--add', 'later'] });
  expect(scanOptionTokens(['--usage', 'all'], { leadingOnly: true }))
    .toMatchObject({ usage: 1, remaining: ['all'] });
});

test('rejects missing trailing additions in leading-option mode', () => {
  expect(() => scanOptionTokens(['all', '--add'], { leadingOnly: true })).toThrow(/requires/);
});
