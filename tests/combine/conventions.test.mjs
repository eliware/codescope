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
  await writeFile(path.join(specs, 'contracts.json'), '{"contracts":[]}');
  await writeFile(path.join(specs, 'web.json'), '{"version":"8.0","web":true}');
  await writeManifest(specs, { general: 'specs/general.json' });
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
    platform: 'win32',
  });
  expect(result).toContain('Convention checkout not supplied');
});
test('uses default convention options when omitted', async () => { const root = await fsTemp('codescope-conventions-defaults-'); try { await expect(combineConventionFiles(root)).resolves.toContain('Convention checkout not supplied'); } finally { await rm(root, { recursive: true, force: true }); } });
test('rejects invalid read concurrency before discovery', async () => { await expect(combineConventionFiles('repo', { concurrency: 0 })).rejects.toThrow(/positive integer/); });
test('uses Windows path semantics when requested', async () => {
  await expect(combineConventionFiles('C:\\project', {
    conventionsRoot: 'C:\\missing-conventions',
    platform: 'win32',
  })).resolves.toContain('Convention checkout not supplied');
});
test('uses POSIX path semantics when requested', async () => {
  await expect(combineConventionFiles('/project', {
    conventionsRoot: '/missing-conventions',
    platform: 'linux',
  })).resolves.toContain('Convention checkout not supplied');
});
test('reports unavailable applicability metadata', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(path.join(root, 'package.json'), '{"eliware":{"conventions":{}}}');
  try {
    const result = await combineConventionFiles(root, { conventionsRoot: root });
    expect(result).toContain('Convention applicability unavailable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('reports convention discovery failures explicitly', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'project', 'package.json'), '{}');
  try {
    await expect(combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readDirectory: async () => { throw Object.assign(new Error('denied'), { code: 'EACCES' }); },
    })).rejects.toThrow(/Unable to discover convention evidence: .*Unable to scan .*denied/);
    await expect(combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readDirectory: async () => { throw 'denied'; },
    })).rejects.toThrow(/Unable to discover convention evidence: .*Unable to scan .*denied/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('reports unavailable applicability for invalid package metadata', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
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
  await writeManifest(path.join(root, 'specs'), { general: 'specs/general.json', cli: 'specs/cli.json' });
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
test('reports unavailable applicability when the canonical manifest is not supplied', async () => {
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
test('reports unavailable applicability when an injected manifest omits an applied profile', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
  );
  try {
    const result = await combineConventionFiles(root, {
      conventionsRoot: root,
      readConventionManifest: async () => JSON.stringify({ repositoryTypes: {} }),
    });
    expect(result).toContain('Convention applicability unavailable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('matches an injected manifest path without a specs segment', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
  );
  try {
    const result = await combineConventionFiles(root, {
      conventionsRoot: root,
      readConventionManifest: async () => JSON.stringify({ repositoryTypes: { general: '../../conventions/specs/general.json' } }),
    });
    expect(result).toContain('conventions/specs/general.json');
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
  await writeFile(path.join(specs, 'contracts.json'), '{}');
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
async function fsTemp(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}
async function writeManifest(specs, repositoryTypes) {
  await writeFile(path.join(specs, 'conventions.json'), JSON.stringify({ repositoryTypes }));
}
