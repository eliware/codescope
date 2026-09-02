import { combineMjsFiles, combineMdFiles } from './combine-mjs.mjs';

export async function combineAllFiles(root, options = {}) {
  const componentOptions = Number.isFinite(options.maxChars)
    ? { ...options, maxChars: Number.POSITIVE_INFINITY }
    : options;

  const [mjs, md] = await Promise.all([
    combineMjsFiles(root, componentOptions),
    combineMdFiles(root, componentOptions),
  ]);
  const combined = [mjs, md].filter(Boolean).join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}

export async function combineSelectedFiles(
  root,
  { implementation = false, tests = false, docs = false, ...options } = {},
) {
  const parts = [];
  const componentOptions = Number.isFinite(options.maxChars)
    ? { ...options, maxChars: Number.POSITIVE_INFINITY }
    : options;
  if (implementation)
    parts.push(await combineMjsFiles(root, { ...componentOptions, noTests: true }));
  if (tests) parts.push(await combineMjsFiles(root, { ...componentOptions, testsOnly: true }));
  if (docs) parts.push(await combineMdFiles(root, componentOptions));
  const combined = parts.filter(Boolean).join('\n');

  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars)
    throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}
