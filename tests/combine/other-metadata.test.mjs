import { formatOtherFile } from '../../src/combine/other-metadata.mjs';

test('formats binary and text file metadata', () => {
  expect(formatOtherFile('a.bin', Buffer.from([0, 1]))).toContain('binary');
  expect(formatOtherFile('a.txt', Buffer.from('one\ntwo'))).toContain('2 lines');
});
