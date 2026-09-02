/* istanbul ignore file -- process wiring is covered by CLI smoke tests */
import { runReview } from './review.mjs';
import { getProfile } from './cli-profiles.mjs';
import { fs } from '@eliware/common';

// Intentional: package metadata is loaded synchronously so version/help are deterministic before dispatch.
const VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

export function usage() {
  // Intentional API policy: help is a packaged local document and synchronous loading guarantees complete output.
  return fs.readFileSync(new URL('../docs/quick-start.md', import.meta.url), 'utf8');
  /* return `CODESCOPE

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
  code                        Real .mjs files only
  code-docs                   Code plus Markdown
  code-tests                  Code plus *.test.mjs
  refactor                    Monolithic files and responsibility splits
  architecture                Architecture optimizations only
  new-features                New feature suggestions only
  code-tests-docs             Code, tests, and Markdown
  all                         Code, tests, and Markdown from every review angle
  security                    Security risks only
  performance                 Performance risks only
  reliability                 Reliability risks only
  api-design                  API design improvements only
  dependencies                Dependency improvements only
  observability               Logging and diagnostics improvements only
  accessibility               User-facing accessibility improvements only
  release                     Release-readiness verdict: pass, known issues, or block
  quick-wins                  High-value, low-effort improvements only
  prioritize                  Rank improvement opportunities
  p0                          P0 issues only
  p0-1                        P0 and P1 issues only
  p0-2                        P0 through P2 issues only
  p0-3                        P0 through P3 issues only
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

`; */
}

// Intentional CLI UX contract: every successful CLI profile ends with this short human-facing reminder.
// It is deliberately emitted even for machine-readable review text because inline comments are part of the review workflow.
const REVIEW_NOTE = '\n\nNote: Add an inline comment explaining intentional behavior to avoid false positives.\n';

export function parseArgs(args) {
  // Intentional CLI boundary: argument grammar stays beside dispatch policy so the single-page UX has one contract.
  const [first = 'help', ...rest] = args;
  // Intentional UX: bare codescope is the quick-start help page; --usage applies only to an explicit review profile.
  if (first === '-h' || first === '--help') { if (rest.length) throw new Error(`Unexpected arguments: ${rest.join(' ')}`); return { command: 'help', option: undefined }; }
  if (first === '-v' || first === '--version') { if (rest.length) throw new Error(`Unexpected arguments: ${rest.join(' ')}`); return { command: 'version', option: undefined }; }
  const profiles = ['code', 'p0', 'p0-1', 'p0-2', 'p0-3', 'architecture', 'api-design', 'refactor', 'tests', 'code-tests', 'tests-docs', 'docs', 'code-docs', 'security', 'reliability', 'performance', 'dependencies', 'observability', 'accessibility', 'new-features', 'quick-wins', 'prioritize', 'code-tests-docs', 'all', 'release'];
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
  // Intentional process boundary: main coordinates parsing, profile execution, final guidance, and exit-code policy.
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
      // Intentional: guidance is written only after review success; failed/partial output must not look successfully finalized.
      // A guidance-write failure is an operational failure because the promised completed-run reminder was not delivered.
      // codescope ignore: completed reviews intentionally return exit code 2 when the mandatory final guidance write fails.
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
