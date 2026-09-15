import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { combineConventionFiles, resolveConventionPath } from '../../src/combine/conventions.mjs';

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
  });
  expect(result).toContain('Convention checkout not supplied');
});

test('rejects convention paths that escape the specs root', () => {
  expect(() => resolveConventionPath('specs', '../outside.json')).toThrow(/escapes specs root/);
});

test('supports explicit POSIX convention path semantics', async () => {
  await expect(combineConventionFiles('repo', {
    conventionsRoot: 'conventions',
    platform: 'linux',
    readDirectory: async () => [],
    readPackageJson: async () => JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
    readConventionManifest: async () => JSON.stringify({ repositoryTypes: { general: 'specs/general.json' } }),
  })).resolves.toContain('Convention evidence incomplete');
  expect(resolveConventionPath('/repo/specs', 'general.json', 'linux')).toBe('/repo/specs/general.json');
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
    expect(result).toContain('conventions/specs/contracts.json');
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

test('normalizes convention paths before matching applied profiles', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(specs, 'general.json'), '{"normalized":true}');
  await writeFile(path.join(specs, 'contracts.json'), '{}');
  await writeFile(
    path.join(root, 'project', 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
  );
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readConventionManifest: async () =>
        JSON.stringify({ repositoryTypes: { general: 'specs\\GENERAL.JSON' } }),
    });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).not.toContain('evidence incomplete');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects symlinked convention evidence before reading it', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
  );
  await writeManifest(path.join(root, 'specs'), { general: 'specs/general.json' });
  try {
    await expect(
      combineConventionFiles(root, {
        conventionsRoot: root,
        inspectFile: async () => ({ isSymbolicLink: () => true, isFile: () => false }),
      }),
    ).rejects.toThrow(/symlinked source files/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects non-file convention evidence before reading it', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general'] } } }),
  );
  await writeManifest(path.join(root, 'specs'), { general: 'specs/general.json' });
  try {
    await expect(
      combineConventionFiles(root, {
        conventionsRoot: root,
        inspectFile: async () => ({ isSymbolicLink: () => false, isFile: () => false }),
      }),
    ).rejects.toThrow(/not a regular file/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('bounds convention reads by concurrency and aggregate characters', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await writeFile(path.join(root, 'specs', 'general.json'), '{"general":true}');
  await writeFile(path.join(root, 'specs', 'cli.json'), '{"cli":true}');
  await writeFile(path.join(root, 'specs', 'contracts.json'), '{}');
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ eliware: { conventions: { apply: ['general', 'cli'] } } }),
  );
  await writeManifest(path.join(root, 'specs'), { general: 'specs/general.json', cli: 'specs/cli.json' });
  try {
    await expect(combineConventionFiles(root, { conventionsRoot: root, concurrency: 0 })).rejects.toThrow(
      /positive integer/,
    );
    await expect(
      combineConventionFiles(root, { conventionsRoot: root, maxChars: 10 }),
    ).rejects.toThrow(/exceeds/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
