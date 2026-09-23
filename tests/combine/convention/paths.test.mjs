import { conventionFilesForApplicability, normalizeConventionPath, resolveConventionPath } from '../../../src/combine/convention/paths.mjs';

test('normalizes and resolves convention paths safely', () => {
  expect(normalizeConventionPath('General\\Spec.JSON')).toBe('general/spec.json');
  expect(resolveConventionPath('repo/specs', 'general.json', 'posix')).toContain('repo');
  expect(resolveConventionPath('C:\\repo\\specs', 'general\\file.json', 'win32')).toContain('repo');
  expect(resolveConventionPath('repo/specs', 'general.json')).toContain('repo');
  expect(() => resolveConventionPath('repo/specs', '../outside', 'posix')).toThrow(/escapes/);
});

test('selects only applied directive records and reports missing records', () => {
  expect(conventionFilesForApplicability(['general.json', 'cli.json', 'private.json'], {
    profiles: new Set(['general', 'cli']),
    canonicalPaths: new Map([['general', 'general.json'], ['cli', 'cli.json']]),
  })).toEqual({ files: ['cli.json', 'general.json'], missing: [] });
  expect(conventionFilesForApplicability(['general.json'], {
    profiles: new Set(['general', 'cli']),
    canonicalPaths: new Map([['general', 'general.json'], ['cli', 'cli.json']]),
  })).toEqual({ files: ['general.json'], missing: ['cli'] });
});

test('reports unsupported and unmapped profile names as missing', () => {
  expect(conventionFilesForApplicability(['general.json'], {
    profiles: new Set(['unsupported', 'unmapped']),
    canonicalPaths: new Map([['unsupported', 'unsupported.json']]),
  })).toEqual({ files: [], missing: ['unsupported', 'unmapped'] });
});

test('selects only indexed canonical records for eliware test and reports missing records', () => {
  expect(conventionFilesForApplicability(['cli.json', 'general.json', 'unrelated.json'], {
    includeAll: true,
    profiles: new Set(['general']),
    canonicalPaths: new Map([['general', 'general.json']]),
  }, ['cli.json', 'general.json', 'private.json'])).toEqual({
    files: ['cli.json', 'general.json'],
    missing: ['private.json'],
  });
});

test('reports the canonical index as missing when no index records are available', () => {
  expect(conventionFilesForApplicability(['unrelated.json'], {
    includeAll: true,
    profiles: new Set(),
    canonicalPaths: new Map(),
  })).toEqual({ files: [], missing: ['specs/README.md (canonical directive index)'] });
});
