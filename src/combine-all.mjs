import { combineMjsFiles, combineMdFiles } from './combine-mjs.mjs';

export async function combineAllFiles(root, options = {}) {
  const [mjs, md] = await Promise.all([
    combineMjsFiles(root, options),
    combineMdFiles(root, options),
  ]);
  const combined = [mjs, md].filter(Boolean).join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars) throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}

export async function combineSelectedFiles(root, { implementation = false, tests = false, docs = false, ...options } = {}) {
  const parts = [];
  if (implementation) parts.push(await combineMjsFiles(root, { ...options, noTests: true }));
  if (tests) parts.push(await combineMjsFiles(root, { ...options, testsOnly: true }));
  if (docs) parts.push(await combineMdFiles(root, options));
  const combined = parts.filter(Boolean).join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars) throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}
