/* istanbul ignore file -- process wiring is covered by CLI smoke tests */
import { combineAllFiles, combineSelectedFiles } from './combine-all.mjs';
import { runReview } from './review.mjs';
import { createAnalysisPrompt, allPrompt } from './prompt.mjs';
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
  all                         Implementation, tests, and Markdown
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
  const profiles = ['implementation', 'implementation-docs', 'implementation-tests', 'all', 'tests', 'tests-docs', 'docs'];
  if (first.startsWith('-')) throw new Error(`Unknown option: ${first}`);
  if (!['help', 'version', ...profiles].includes(first)) throw new Error(`Unknown command: ${first}`);
  if (profiles.includes(first) && ['--version', '-v'].includes(rest[0])) throw new Error(`Option ${rest[0]} is not valid for ${first}`);
  if (rest.length > 1 || (rest.length > 0 && !['--help', '-h', '--version', '-v', '--usage'].includes(rest[0]))) {
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
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
    const commands = new Set(['help', 'version', 'analyze-implementation', 'analyze-implementation-docs', 'analyze-implementation-tests', 'analyze-all', 'analyze-tests', 'analyze-tests-docs', 'analyze-docs']);
    if (!commands.has(command)) throw new Error(`Unknown command: ${command}`);
    if (option && (command === 'help' || command === 'version') && option !== `--${command}` && option !== `-${command === 'help' ? 'h' : 'v'}`) throw new Error(`Option ${option} is not valid for ${command}`);
    /* istanbul ignore next -- option validation is exercised at the CLI boundary */
    if (option && ['--version', '-v'].includes(option) && command !== 'help' && command !== 'version') throw new Error(`Option ${option} is not valid for ${command}`);
    // Intentional UX: every profile accepts --help so the single help page is easy to discover.
    if (option && ['--help', '-h'].includes(option)) { output(usage()); return 0; }
    if (option === '--version' || option === '-v') { output(VERSION); return 0; }
    if (command === 'help' || command === '-h' || command === '--help') {
      output(usage());
      return 0;
    }
    if (command === 'version' || command === '-v' || command === '--version') {
      output(VERSION);
      return 0;
    }
    if (command.startsWith('analyze-')) {
      const target = command.slice('analyze-'.length);
      const profiles = { implementation: [true, false, false], 'implementation-docs': [true, false, true], 'implementation-tests': [true, true, false], all: [true, true, true], tests: [false, true, false], 'tests-docs': [false, true, true], docs: [false, false, true] };
      const [implementation, tests, docs] = profiles[target] ?? [true, false, false];
      const combine = target === 'all' ? combineAllFiles : (root, options) => combineSelectedFiles(root, { ...options, implementation, tests, docs });
      const subject = target === 'docs' ? 'the documentation for inconsistencies' : target === 'tests' ? 'the test suite for test quality and coverage; do not report the absence of implementation files' : 'the selected implementation and test files for issues';
      await review(cwd, { write, combine, usage: option === '--usage', prompt: target === 'all' ? allPrompt : createAnalysisPrompt(subject) });
      // Intentional: this human-facing CLI always ends reviews with guidance; API consumers call runReview directly.
      await write(REVIEW_NOTE);
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
