import { conventionFilesForApplicability, normalizeConventionPath, resolveConventionPath } from '../../../src/combine/convention/paths.mjs';
import { combineConventionFiles } from '../../../src/combine/conventions.mjs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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

test('supports explicit POSIX convention path semantics', async () => {
  await expect(combineConventionFiles('repo', {
    conventionsRoot: 'conventions', platform: 'linux', readDirectory: async () => [],
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
    readConventionManifest: async () => JSON.stringify({ repositoryTypes: { general: 'specs/general.json' } }),
  })).resolves.toContain('Convention evidence incomplete');
  expect(resolveConventionPath('/repo/specs', 'general.json', 'linux')).toBe('/repo/specs/general.json');
});

test('normalizes convention paths before matching applied profiles', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'codescope-conventions-'));
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'specs', 'general.json'), '{"normalized":true}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(path.join(root, 'project', 'package.json'), JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }));
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readConventionManifest: async () => JSON.stringify({ repositoryTypes: { general: 'specs\\GENERAL.JSON' } }),
    });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).not.toContain('evidence incomplete');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
