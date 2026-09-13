export function validateScanRoot(root, platform) {
  if (typeof root !== 'string') throw new Error('Scan root must be a path string');
  if (platform !== 'win32' && /^(?:[A-Za-z]:[\\/]|\\\\|\/\/)/u.test(root))
    throw new Error('Windows-style scan roots require a Windows host');
}

export function validateScanMode(noTests, testsOnly) {
  if (noTests && testsOnly) throw new Error('noTests and testsOnly cannot both be enabled');
}

export function validateScanRootMetadata(metadata) {
  if (metadata.isSymbolicLink()) throw new Error('symlinked scan roots are not supported');
}
