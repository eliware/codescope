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
