import { validateScanMode, validateScanRoot, validateScanRootMetadata } from '../../src/find/root-policy.mjs';

test('accepts native roots and rejects foreign Windows roots', () => {
  expect(() => validateScanRoot('repo', 'linux')).not.toThrow();
  expect(() => validateScanRoot('C:\\repo', 'win32')).not.toThrow();
  expect(() => validateScanRoot('C:\\repo', 'linux')).toThrow(/Windows-style/);
  expect(() => validateScanRoot(null, 'linux')).toThrow(/path string/);
});

test('rejects contradictory scan modes and symlink roots', () => {
  expect(() => validateScanMode(false, false)).not.toThrow();
  expect(() => validateScanMode(true, true)).toThrow(/both/);
  expect(() => validateScanRootMetadata({ isSymbolicLink: () => true })).toThrow(/symlinked/);
  expect(() => validateScanRootMetadata({ isSymbolicLink: () => false })).not.toThrow();
});
