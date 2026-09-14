import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { combineConventionFiles } from '../../src/combine/conventions.mjs';

test('includes convention specs and excludes package metadata', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(specs, 'general.json'), '{"version":"8.0"}');
  await writeFile(path.join(specs, 'web.json'), '{"version":"8.0","web":true}');
  await writeFile(path.join(root, 'package.json'), '{}');
  await writeFile(path.join(root, 'package-lock.json'), '{}');
  await writeFile(
    path.join(root, 'project', 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
    });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).toContain('"version":"8.0"');
    expect(result).not.toContain('web.json');
    expect(result).not.toContain('package-lock.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports unavailable sibling checkout', async () => {
  const result = await combineConventionFiles('C:/missing-project', {
    conventionsRoot: 'C:/missing-conventions',
  });
  expect(result).toContain('Convention checkout not supplied');
});

test('reports unavailable applicability metadata', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'package.json'), '{"eliware":{"conventions":{}}}');
  try {
    const result = await combineConventionFiles(root, { conventionsRoot: root });
    expect(result).toContain('Convention applicability unavailable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports unavailable applicability for invalid package metadata', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'package.json'), '{invalid');
  try {
    const result = await combineConventionFiles(root, { conventionsRoot: root });
    expect(result).toContain('Convention applicability unavailable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports unverified convention evidence when an applied profile is missing', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(
    path.join(root, 'project', 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general', 'cli'] } } }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
    });
    expect(result).toContain('Convention evidence incomplete');
    expect(result).toContain('cli');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports unavailable applicability when a repository type is not in the manifest', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'specs', 'unknown.json'), '{}');
  await writeFile(
    path.join(root, 'project', 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['unknown'] } } }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
    });
    expect(result).toContain('Convention applicability unavailable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('uses the injected convention manifest reader for virtual roots', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(specs, 'virtual.json'), '{"virtual":true}');
  await writeFile(
    path.join(root, 'project', 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['virtual'] } } }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['virtual'] } } }),
      readConventionManifest: async () =>
        JSON.stringify({ repositoryTypes: { virtual: 'specs/virtual.json' } }),
    });
    expect(result).toContain('conventions/specs/virtual.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('includes every convention JSON for @eliware/test', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(specs, 'general.json'), '{"profile":"general"}');
  await writeFile(path.join(specs, 'application.json'), '{"profile":"application"}');
  await writeFile(path.join(specs, 'cli.json'), '{"profile":"cli"}');
  await writeFile(path.join(specs, 'npm-published.json'), '{"profile":"npm-published"}');
  await writeFile(
    path.join(root, 'project', 'package.json'),
    JSON.stringify({ name: '@eliware/test', eliware: { conventions: { apply: ['general'] } } }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readConventionManifest: async () => { throw new Error('manifest is not required'); },
    });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).toContain('conventions/specs/application.json');
    expect(result).toContain('conventions/specs/cli.json');
    expect(result).toContain('conventions/specs/npm-published.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function fsTemp(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}
