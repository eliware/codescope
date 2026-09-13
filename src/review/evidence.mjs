import { fs } from '@eliware/common';

export async function collectReviewEvidence({
  cwd,
  combine,
  readDirectory,
  readFile,
  maxSourceChars,
}) {
  const combined = await combine(cwd, {
    readDirectory,
    readFileContents: readFile,
    validateSymlinks: readFile === fs.promises.readFile,
    maxChars: maxSourceChars,
  });
  return { combined };
}
