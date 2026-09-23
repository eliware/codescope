import { readConventionApplicability } from '../../../src/combine/convention/applicability.mjs';
import { combineConventionFiles } from '../../../src/combine/conventions.mjs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const fsTemp = (prefix) => mkdtemp(path.join(os.tmpdir(), prefix));
const writeManifest = (specs, repositoryTypes) =>
  writeFile(path.join(specs, 'conventions.json'), JSON.stringify({ repositoryTypes }));

test('includes every convention JSON for @eliware/test', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(specs, 'general.json'), '{"profile":"general"}');
  await writeFile(path.join(specs, 'contracts.json'), '{"contracts":[]}');
  await writeFile(path.join(specs, 'application.json'), '{"profile":"application"}');
  await writeFile(path.join(specs, 'cli.json'), '{"profile":"cli"}');
  await writeFile(path.join(specs, 'npm-published.json'), '{"profile":"npm-published"}');
  await writeFile(path.join(root, 'project', 'package.json'), JSON.stringify({ name: '@eliware/test', eliware: { conventions: { apply: ['general'] } } }));
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), { conventionsRoot: root, readConventionManifest: async () => { throw new Error('manifest is not required'); } });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).toContain('conventions/specs/application.json');
    expect(result).toContain('conventions/specs/cli.json');
    expect(result).toContain('conventions/specs/npm-published.json');
    expect(result).toContain('conventions/specs/contracts.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('includes every convention for the eliware test package', async () => {
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    readPackageJson: async () => JSON.stringify({ name: '@eliware/test' }),
    readFileContents: async () => '',
    readConventionManifest: async () => '',
    platform: 'posix',
  })).resolves.toMatchObject({ includeAll: true });
});

test('resolves applied convention paths from the manifest', async () => {
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions',
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
    readConventionManifest: async () => JSON.stringify({ repositoryTypes: { general: 'C:/conventions/specs/general.json' } }),
  })).resolves.toMatchObject({ includeAll: false, canonicalPaths: new Map([['general', 'general.json']]) });
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions', platform: 'win32',
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
    readFileContents: async () => JSON.stringify({ repositoryTypes: { general: 'general.json' } }),
  })).resolves.toMatchObject({ includeAll: false });
});

test('returns unavailable for malformed or incomplete applicability data', async () => {
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions', readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: [1] } } }),
  })).resolves.toBeNull();
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions', readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['missing'] } } }),
    readConventionManifest: async () => JSON.stringify({ repositoryTypes: {} }),
  })).resolves.toBeNull();
  await expect(readConventionApplicability('repo', {
    conventionsRoot: 'conventions', readPackageJson: async () => { throw new Error('bad json'); },
  })).resolves.toBeNull();
});

test('uses default readers and manifest discovery', async () => {
  const root = await fsTemp('codescope-applicability-defaults-');
  const project = path.join(root, 'project');
  const specs = path.join(root, 'conventions', 'specs');
  await mkdir(project, { recursive: true });
  await mkdir(specs, { recursive: true });
  await writeFile(path.join(project, 'package.json'), JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }));
  await writeFile(path.join(specs, 'conventions.json'), JSON.stringify({ repositoryTypes: { general: 'specs/general.json' } }));
  await expect(readConventionApplicability(project, { conventionsRoot: path.join(root, 'conventions') }))
    .resolves.toMatchObject({ includeAll: false, profiles: new Set(['general']) });
  await rm(root, { recursive: true, force: true });
});

test('returns unavailable when applicability options are omitted', async () => {
  await expect(readConventionApplicability('missing')).resolves.toBeNull();
});

test('bounds convention reads by concurrency and aggregate characters', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{"general":true}');
  await writeFile(path.join(root, 'specs', 'cli.json'), '{"cli":true}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ eliware: { conventions: { apply: ['general', 'cli'] } } }));
  await writeManifest(path.join(root, 'specs'), { general: 'specs/general.json', cli: 'specs/cli.json' });
  try {
    await expect(combineConventionFiles(root, { conventionsRoot: root, concurrency: 0 })).rejects.toThrow(/positive integer/);
    await expect(combineConventionFiles(root, { conventionsRoot: root, maxChars: 10 })).rejects.toThrow(/exceeds/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test.each([
  ['symlinked', { isSymbolicLink: () => true, isFile: () => false }, /symlinked source files/],
  ['non-file', { isSymbolicLink: () => false, isFile: () => false }, /not a regular file/],
])('rejects %s convention evidence before reading it', async (_kind, inspection, message) => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }));
  await writeManifest(path.join(root, 'specs'), { general: 'specs/general.json' });
  try {
    await expect(combineConventionFiles(root, { conventionsRoot: root, inspectFile: async () => inspection })).rejects.toThrow(message);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
