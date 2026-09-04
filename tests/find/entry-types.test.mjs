import { classifyEntry } from '../../src/find/entry-types.mjs';

test('classifies symlinks as skipped before inspecting their target type', () => {
  expect(classifyEntry({ isSymbolicLink: () => true }, 'src')).toEqual({ skip: true });
});

test('classifies regular directories and files', () => {
  expect(classifyEntry({ isDirectory: () => true, isFile: () => false }, 'src')).toEqual({ isDirectory: true, isFile: false, skip: false });
  expect(classifyEntry({ isDirectory: () => false, isFile: () => true }, 'src')).toEqual({ isDirectory: false, isFile: true, skip: false });
});

test('rejects ambiguous, unknown, and throwing entries', () => {
  expect(() => classifyEntry({ isDirectory: () => true, isFile: () => true }, 'src')).toThrow('Invalid directory entry');
  expect(() => classifyEntry({}, 'src')).toThrow('Invalid directory entry');
  expect(() => classifyEntry({ isDirectory: () => { throw new Error('bad metadata'); } }, 'src')).toThrow('Unable to scan');
});
