import { conventionFilesForApplicability, normalizeConventionPath, resolveConventionPath } from '../../../src/combine/convention/paths.mjs';

test('normalizes and resolves convention paths safely', () => {
  expect(normalizeConventionPath('General\\Spec.JSON')).toBe('general/spec.json');
  expect(resolveConventionPath('repo/specs', 'general.json', 'posix')).toContain('repo');
  expect(resolveConventionPath('C:\\repo\\specs', 'general\\file.json', 'win32')).toContain('repo');
  expect(resolveConventionPath('repo/specs', 'general.json')).toContain('repo');
  expect(() => resolveConventionPath('repo/specs', '../outside', 'posix')).toThrow(/escapes/);
});
test('selects applicable convention records and reports missing records', () => {
  const result = conventionFilesForApplicability(['general.json', 'contracts.json'], {
    profiles: new Set(['general', 'cli']),
    canonicalPaths: new Map([['general', 'general.json'], ['cli', 'cli.json']]),
    includeAll: false,
  });
  expect(result.files).toEqual(['contracts.json', 'general.json']);
  expect(result.missing).toEqual(['cli']);
});
test('includes all discovered files without missing records for the full checkout', () => {
  expect(conventionFilesForApplicability(['contracts.json', 'general.json'], {
    profiles: new Set(['general']), canonicalPaths: new Map([['general', 'general.json']]), includeAll: true,
  })).toEqual({ files: ['contracts.json', 'general.json'], missing: [] });
  expect(conventionFilesForApplicability(['general.json'], {
    profiles: new Set(), canonicalPaths: new Map(), includeAll: true,
  })).toEqual({ files: ['general.json'], missing: ['contracts.json'] });
});

test('rejects convention paths that escape the specs root', () => {
  expect(() => resolveConventionPath('specs', '../outside.json')).toThrow(/escapes specs root/);
});

