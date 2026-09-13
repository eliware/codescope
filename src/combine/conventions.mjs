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
    inspectFile = lstat,
  } = {},
) {
  const specsRoot = path.join(conventionsRoot, 'specs');
  try {
    await access(specsRoot);
  } catch {
    return '===== Convention v8 JSON =====\nConvention checkout not supplied.\n';
  }

  const apply = await readConventionApplicability(root, { readFileContents });
  if (!apply) return '===== Convention v8 JSON =====\nConvention applicability unavailable.\n';
  const files = (await findFiles(specsRoot, '.json', { readDirectory })).filter((relativePath) => {
    const profile = path.basename(relativePath, '.json');
    return apply.has(profile) && relativePath === `${profile}.json`;
  });
  const supplied = new Set(files.map((relativePath) => path.basename(relativePath, '.json')));
  const missing = [...apply].filter((profile) => !supplied.has(profile));
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

async function readConventionApplicability(root, { readFileContents = readFile } = {}) {
  try {
    const packageJson = JSON.parse(
      await readFileContents(path.resolve(root, 'package.json'), 'utf8'),
    );
    const apply = packageJson.eliware?.conventions?.apply;
    return Array.isArray(apply) && apply.every((name) => typeof name === 'string')
      ? new Set(apply)
      : null;
  } catch {
    return null;
  }
}
