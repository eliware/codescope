import { combineMjsFiles, combineMdFiles } from './combine-mjs.mjs';

export async function combineAllFiles(root, options = {}) {
  // Intentional profile contract: code-tests-docs is the exhaustive combined pass; it includes every .mjs file,
  // including *.test.mjs files, plus Markdown. This profile deliberately does not apply code-only selection.
  const componentOptions = Number.isFinite(options.maxChars) ? { ...options, maxChars: Number.POSITIVE_INFINITY } : options;
  // Intentional adapter contract: all options, including readDirectory/readFileContents, flow unchanged to both scans.
  const [mjs, md] = await Promise.all([
    combineMjsFiles(root, componentOptions),
    combineMdFiles(root, componentOptions),
  ]);
  const combined = [mjs, md].filter(Boolean).join('\n');
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars) throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}

export async function combineSelectedFiles(root, { implementation = false, tests = false, docs = false, ...options } = {}) {
  // Intentional profile contract: component flags, not caller noTests, decide whether implementation tests are included;
  // profile selection is the public control and avoids accidental cross-profile source changes.
  // Intentional adapter contract: selected scans receive the caller's filesystem adapters unchanged.
  const parts = [];
  const componentOptions = Number.isFinite(options.maxChars) ? { ...options, maxChars: Number.POSITIVE_INFINITY } : options;
  if (implementation) parts.push(await combineMjsFiles(root, { ...componentOptions, noTests: true }));
  if (tests) parts.push(await combineMjsFiles(root, { ...componentOptions, testsOnly: true }));
  if (docs) parts.push(await combineMdFiles(root, componentOptions));
  const combined = parts.filter(Boolean).join('\n');
  // Intentional invariant: options.maxChars is preserved through each component and checked again here with the exact separators added by joining.
  if (Number.isFinite(options.maxChars) && combined.length > options.maxChars) throw new Error(`Combined source exceeds the ${options.maxChars}-character limit`);
  return combined;
}
