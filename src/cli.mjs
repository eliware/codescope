/* istanbul ignore file -- process wiring is covered by CLI smoke tests */
import { runReview } from './review.mjs';
import { getProfile } from './cli-profiles.mjs';
import { fs } from '@eliware/common';

// Intentional: package metadata is loaded synchronously so version/help are deterministic before dispatch.
const VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

export function usage() {
  return `CODESCOPE

What it does:
  Codescope reviews the current repository with OpenAI. It combines selected
  source files, sends them with a focused review prompt, and streams findings
  back to the terminal with priority, path, and line references.

How it works:
  Files are selected below the current directory, excluding .git and
  node_modules. Symlinked files and directories are skipped. The API token is
  read from ~/.codescope; process environment variables take precedence.

Usage:
  codescope
  codescope <profile>

Analysis profiles:
  implementation              Real .mjs files only
  implementation-docs         Implementation plus Markdown
  implementation-tests        Implementation plus *.test.mjs
  refactor                    Monolithic files and responsibility splits
  architecture                Architecture optimizations only
  new-features                New feature suggestions only
  implementation-tests-docs  Implementation, tests, and Markdown
  security                    Security risks only
  performance                 Performance risks only
  reliability                 Reliability risks only
  api-design                  API design improvements only
  dependencies                Dependency improvements only
  observability               Logging and diagnostics improvements only
  accessibility               User-facing accessibility improvements only
  release                     Packaging and release improvements only
  quick-wins                  High-value, low-effort improvements only
  prioritize                  Rank improvement opportunities
  tests                       *.test.mjs only
  tests-docs                  Tests plus Markdown
  docs                        Markdown only

Help and version:
  --help, help                Show this complete help page
  --version, version          Show the installed version
  --usage                     Include API token usage after the review

Intentional behavior:
  Add a nearby inline comment explaining intentional policy decisions, for
  example: "Intentional: synchronous startup keeps --help deterministic."
  The reviewer is instructed to honor these comments and not report the
  documented behavior as a false positive.

`;
}

const REVIEW_NOTE = '\n\nNote: Add an inline comment explaining intentional behavior to avoid false positives.\n';

export function parseArgs(args) {
  const [first = 'help', ...rest] = args;
  if (first === '-h' || first === '--help') { if (rest.length) throw new Error(`Unexpected arguments: ${rest.join(' ')}`); return { command: 'help', option: undefined }; }
  if (first === '-v' || first === '--version') { if (rest.length) throw new Error(`Unexpected arguments: ${rest.join(' ')}`); return { command: 'version', option: undefined }; }
  const profiles = ['implementation', 'implementation-docs', 'implementation-tests', 'implementation-tests-docs', 'refactor', 'architecture', 'new-features', 'security', 'performance', 'reliability', 'api-design', 'dependencies', 'observability', 'accessibility', 'release', 'quick-wins', 'prioritize', 'tests', 'tests-docs', 'docs'];
  if (first.startsWith('-')) throw new Error(`Unknown option: ${first}`);
  if (!['help', 'version', ...profiles].includes(first)) throw new Error(`Unknown command: ${first}`);
  if (profiles.includes(first) && ['--version', '-v'].includes(rest[0])) throw new Error(`Option ${rest[0]} is not valid for ${first}`);
  if (rest.length > 1 || (rest.length > 0 && !['--help', '-h', '--version', '-v', '--usage'].includes(rest[0]))) {
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
  // Intentional policy: --usage belongs only to review profiles; help/version accept only their own aliases.
  if (['help', 'version'].includes(first) && rest.length > 0 && !((first === 'help' && ['--help', '-h'].includes(rest[0])) || (first === 'version' && ['--version', '-v'].includes(rest[0])))) throw new Error(`Option ${rest[0]} is not valid for ${first}`);
  return { command: first === 'help' || first === 'version' ? first : `analyze-${first}`, option: rest[0] };
}

export async function main(args, {
  output = console.log,
  error = console.error,
  write = process.stdout.write.bind(process.stdout),
  cwd = process.cwd(),
  review = runReview,
} = {}) {
  try {
    const { command, option } = parseArgs(args);
    if (!['help', 'version'].includes(command) && !command.startsWith('analyze-')) throw new Error(`Unknown command: ${command}`);
    if (option && (command === 'help' || command === 'version') && option !== `--${command}` && option !== `-${command === 'help' ? 'h' : 'v'}`) throw new Error(`Option ${option} is not valid for ${command}`);
    /* istanbul ignore next -- option validation is exercised at the CLI boundary */
    if (option && ['--version', '-v'].includes(option) && command !== 'help' && command !== 'version') throw new Error(`Option ${option} is not valid for ${command}`);
    // Intentional UX: every profile accepts --help so the single help page is easy to discover.
    if (option && ['--help', '-h'].includes(option)) { output(usage()); return 0; }
    if (option === '--version' || option === '-v') { output(VERSION); return 0; }
    if (command === 'help') {
      output(usage());
      return 0;
    }
    if (command === 'version') {
      output(VERSION);
      return 0;
    }
    if (command.startsWith('analyze-')) {
      const target = command.slice('analyze-'.length);
      const { combine, prompt } = getProfile(target);
      await review(cwd, { write, combine, usage: option === '--usage', prompt });
      // Intentional: this human-facing CLI always ends reviews with guidance; API consumers call runReview directly.
      try { await write(REVIEW_NOTE); } catch (cause) { throw new Error(`Unable to write review guidance: ${cause instanceof Error ? cause.message : String(cause)}`, { cause }); }
      return 0;
    }
    return 2;
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    if (cause instanceof Error && cause.message.startsWith('Unknown command')) error('Run "codescope --help" for usage.');
    return 2;
  }
}

export { VERSION };
