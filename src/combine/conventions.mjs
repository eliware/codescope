import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { findFiles } from '../find/files.mjs';
import { formatSourceSection } from './section-format.mjs';

export async function combineConventionFiles(
  root,
  { conventionsRoot = path.resolve(root, '..', 'conventions'), readDirectory } = {},
) {
  const specsRoot = path.join(conventionsRoot, 'specs');
  try {
    await access(specsRoot);
  } catch {
    return '===== Convention v8 JSON =====\nConvention checkout not supplied.\n';
  }

  const apply = await readConventionApplicability(root);
  if (!apply) return '===== Convention v8 JSON =====\nConvention applicability unavailable.\n';
  const files = (await findFiles(specsRoot, '.json', { readDirectory })).filter((relativePath) =>
    apply.has(path.basename(relativePath, '.json')),
  );
  const sections = await Promise.all(
    files.map(async (relativePath) => {
      const contents = await readFile(path.resolve(specsRoot, relativePath), 'utf8');
      return formatSourceSection('conventions/specs/' + relativePath, contents);
    }),
  );
  return '===== Convention v8 JSON =====\n' + sections.join('\n') + '\n';
}

async function readConventionApplicability(root) {
  try {
    const packageJson = JSON.parse(await readFile(path.resolve(root, 'package.json'), 'utf8'));
    const apply = packageJson.eliware?.conventions?.apply;
    return Array.isArray(apply) && apply.every((name) => typeof name === 'string')
      ? new Set(apply)
      : null;
  } catch {
    return null;
  }
}
