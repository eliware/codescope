import { scanOptionStream } from '../../../src/cli/options/scan-option-stream.mjs';

test('scans normal and leading option boundaries through one stream', () => {
  expect(scanOptionStream(['--effort=low', 'all', '--add', 'later'], { leadingOnly: true }))
    .toMatchObject({ effort: ['--effort=low'], add: ['later'], remaining: ['all', '--add', 'later'] });
  expect(scanOptionStream(['--effort=low', '--usage'], { keepScalarOptions: true }))
    .toMatchObject({ effort: ['--effort=low'], usage: 1, remaining: ['--effort=low', '--usage'] });
});

test('uses default scan options for ordinary tokens', () => {
  expect(scanOptionStream(['text'])).toMatchObject({ remaining: ['text'], consumed: 0 });
});

test('scans repeatable additions and scalar options', () => {
  expect(scanOptionStream(['-a', 'one', '--model=gpt-5.6-sol', '--usage'])).toMatchObject({
    add: ['one'], model: ['--model=gpt-5.6-sol'], usage: 1,
  });
});

test('drops scalar options from remaining tokens unless requested', () => {
  expect(scanOptionStream(['--effort', 'low', '--model', 'gpt-5.6-sol', '--effort=medium', '--model=gpt-5.6-luna']))
    .toMatchObject({ remaining: [], effort: ['--effort=low', '--effort=medium'], model: ['--model=gpt-5.6-sol', '--model=gpt-5.6-luna'] });
});

test('drops dry-run and keeps usage in normal scanning', () => {
  expect(scanOptionStream(['--dry-run', '--usage', 'text']))
    .toMatchObject({ dryRun: 1, usage: 1, remaining: ['--usage', 'text'] });
});

test('preserves scalar options when requested', () => {
  expect(scanOptionStream([
    '--effort', 'low', '--model', 'gpt-5.6-luna', '--dry-run', '--usage', '--add', 'note', 'text',
  ], { keepScalarOptions: true })).toMatchObject({
    effort: ['--effort=low'], model: ['--model=gpt-5.6-luna'], dryRun: 1, usage: 1,
    add: ['note'], remaining: ['--effort=low', '--model=gpt-5.6-luna', '--dry-run', '--usage', 'text'],
  });
});

test('rejects missing option values', () => {
  expect(() => scanOptionStream(['--add'])).toThrow(/requires/);
  expect(() => scanOptionStream(['--effort'])).toThrow(/requires/);
  expect(() => scanOptionStream(['--model', '--dry-run'])).toThrow(/requires/);
  expect(() => scanOptionStream(['--add', '   '])).toThrow(/requires/);
});

test('rejects missing trailing additions in leading mode', () => {
  expect(() => scanOptionStream(['all', '--add'], { leadingOnly: true })).toThrow(/requires/);
});

test('consumes usage before the command in leading mode', () => {
  expect(scanOptionStream(['--usage', 'all'], { leadingOnly: true }))
    .toMatchObject({ usage: 1, remaining: ['all'] });
});
