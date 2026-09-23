import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { combineConventionFiles } from '../../src/combine/conventions.mjs';

test('includes only package-selected directive records', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  await mkdir(specs, { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(specs, 'general.json'), '{"version":"8.0"}');
  await writeFile(path.join(specs, 'cli.json'), '{"cli":true}');
  await writeFile(path.join(specs, 'web.json'), '{"web":true}');
  await writeFile(path.join(root, 'project', 'package.json'), JSON.stringify({
    eliware: { apply: ['general', 'cli'] },
  }));
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), {
      conventionsRoot: root,
      readFileContents: readFile,
    });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).toContain('conventions/specs/cli.json');
    expect(result).not.toContain('web.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports unknown applied directive profiles as missing evidence', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'specs', 'general.json'), '{}');
  await writeFile(path.join(root, 'project', 'package.json'), JSON.stringify({
    eliware: { apply: ['general', 'unsupported'] },
  }));
  try {
    const result = await combineConventionFiles(path.join(root, 'project'), { conventionsRoot: root });
    expect(result).toContain('Convention evidence incomplete');
    expect(result).toContain('unsupported');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('supplies only indexed canonical records to eliware-test and reports missing indexed records', async () => {
  const root = await fsTemp('codescope-conventions-');
  const specs = path.join(root, 'specs');
  const project = path.join(root, 'project');
  await mkdir(specs, { recursive: true });
  await mkdir(project);
  await writeFile(path.join(specs, 'README.md'), [
    '# Convention specifications',
    '## Files',
    '- [general.json](general.json)',
    '- [cli.json](cli.json)',
    '- [authority.json](authority.json) — Local authority registry.',
  ].join('\n'));
  await writeFile(path.join(specs, 'general.json'), '{"canonical":"general"}');
  await writeFile(path.join(specs, 'cli.json'), '{"canonical":"cli"}');
  await writeFile(path.join(specs, 'authority.json'), '{"authority":true}');
  await writeFile(path.join(specs, 'unrelated.json'), '{"unrelated":true}');
  await writeFile(path.join(project, 'package.json'), JSON.stringify({
    name: '@eliware/test',
    eliware: { apply: ['general'] },
  }));
  try {
    const result = await combineConventionFiles(project, { conventionsRoot: root });
    expect(result).toContain('conventions/specs/general.json');
    expect(result).toContain('conventions/specs/cli.json');
    expect(result).not.toContain('authority.json');
    expect(result).not.toContain('unrelated.json');

    await rm(path.join(specs, 'cli.json'));
    const incomplete = await combineConventionFiles(project, { conventionsRoot: root });
    expect(incomplete).toContain('Convention evidence incomplete');
    expect(incomplete).toContain('cli.json');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports unavailable checkout and applicability', async () => {
  await expect(combineConventionFiles('C:/missing-project', {
    conventionsRoot: 'C:/missing-conventions', platform: 'win32',
  })).resolves.toContain('Convention checkout not supplied');
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  try {
    await expect(combineConventionFiles(path.join(root, 'project'), { conventionsRoot: root }))
      .resolves.toContain('Convention applicability unavailable');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports invalid applicability separately from an unavailable checkout', async () => {
  const root = await fsTemp('codescope-conventions-');
  await mkdir(path.join(root, 'specs'), { recursive: true });
  await mkdir(path.join(root, 'project'));
  await writeFile(path.join(root, 'project', 'package.json'), '{');
  try {
    await expect(combineConventionFiles(path.join(root, 'project'), { conventionsRoot: root }))
      .resolves.toContain('Convention applicability invalid: package.json is not valid JSON.');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('rejects invalid read concurrency before discovery', async () => {
  await expect(combineConventionFiles('repo', { concurrency: 0 })).rejects.toThrow(/positive integer/);
});

test('uses default convention options when omitted', async () => {
  await expect(combineConventionFiles('C:/missing-project'))
    .resolves.toContain('Convention checkout not supplied');
});

async function fsTemp(prefix) {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}
