import { access, lstat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from '../find/files.mjs';
import { readSourceFile } from './read-file.mjs';
import { formatSourceSection } from './section-format.mjs';

export async function combineConventionFiles(
  root,
  {
    conventionsRoot = path.resolve(root, '..', 'conventions'),
    readDirectory,
    readFileContents = readFile,
    readConventionManifest = readFile,
    inspectFile = lstat,
  } = {},
) {
  const specsRoot = path.join(conventionsRoot, 'specs');
  try {
    await access(specsRoot);
  } catch {
    return '===== Convention v8 JSON =====\nConvention checkout not supplied.\n';
  }

  const applicability = await readConventionApplicability(root, {
    readFileContents,
    readConventionManifest,
  });
  if (!applicability) return '===== Convention v8 JSON =====\nConvention applicability unavailable.\n';
  const { profiles, canonicalPaths } = applicability;
  const files = (await findFiles(specsRoot, '.json', { readDirectory })).filter((relativePath) => {
    return [...canonicalPaths.values()].includes(relativePath);
  });
  const supplied = new Set(files);
  const missing = [...profiles].filter((profile) => !supplied.has(canonicalPaths.get(profile)));
  if (missing.length > 0) {
    return (
      '===== Convention v8 JSON =====\n' +
      'Convention evidence incomplete; missing applied profiles: ' +
      missing.join(', ') +
      '.\n'
    );
  }
  const sections = [];
  for (const relativePath of files) {
    const contents = await readSourceFile(
      'conventions/specs/' + relativePath,
      path.resolve(specsRoot, relativePath),
      { readFileContents, inspectFile, validateSymlinks: true },
    );
    sections.push(formatSourceSection('conventions/specs/' + relativePath, contents));
  }
  return '===== Convention v8 JSON =====\n' + sections.join('\n') + '\n';
}

async function readConventionApplicability(
  root,
  { readFileContents = readFile, readConventionManifest = readFile } = {},
) {
  try {
    const packageJson = JSON.parse(
      await readFileContents(path.resolve(root, 'package.json'), 'utf8'),
    );
    const manifest = JSON.parse(
      await readConventionManifest(new URL('../../specs/conventions.json', import.meta.url), 'utf8'),
    );
    const apply = packageJson.eliware?.conventions?.apply;
    const repositoryTypes = manifest.repositoryTypes;
    if (!Array.isArray(apply) || !apply.every((name) => typeof name === 'string')) return null;
    const canonicalPaths = new Map();
    for (const name of apply) {
      if (!Object.hasOwn(repositoryTypes, name)) return null;
      const relativePath = path.posix.basename(String(repositoryTypes[name]).replaceAll('\\', '/'));
      canonicalPaths.set(name, relativePath);
    }
    return { profiles: new Set(apply), canonicalPaths };
  } catch {
    return null;
  }
}
