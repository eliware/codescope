import { fs } from '@eliware/common';

export async function collectReviewEvidence({
  cwd,
  combine,
  readDirectory,
  readFile,
  maxSourceChars,
  platform,
}) {
  const combined = await combine(cwd, {
    readDirectory,
    readFileContents: readFile,
    validateSymlinks: readFile === fs.promises.readFile,
    maxChars: maxSourceChars,
    platform,
  });
  return { combined };
}
