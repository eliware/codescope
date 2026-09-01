import { findMjsFiles } from './find-mjs.mjs';
import { combineMjsFiles } from './combine-mjs.mjs';
import { runReview } from './review.mjs';

const VERSION = '0.1.0';

export function usage() {
  return `Usage: codescope <command> [options]

Commands:
  help       Show this help message
  version    Show the installed version
  find-mjs   List every .mjs file below the current directory
  combine-mjs Combine every .mjs file with path headers

Options:
  -h, --help       Show this help message
  -v, --version    Show the installed version`;
}

export function parseArgs(args) {
  const [first = 'review', ...rest] = args;
  if (rest.length > 0) {
    throw new Error(`Unexpected arguments: ${rest.join(' ')}`);
  }
  return { command: first };
}

export async function main(args, { output = console.log, error = console.error, cwd = process.cwd(), review = runReview } = {}) {
  try {
    const { command } = parseArgs(args);
    if (command === 'help' || command === '-h' || command === '--help') {
      output(usage());
      return 0;
    }
    if (command === 'version' || command === '-v' || command === '--version') {
      output(VERSION);
      return 0;
    }
    if (command === 'find-mjs') {
      for (const file of await findMjsFiles(cwd)) output(file);
      return 0;
    }
    if (command === 'combine-mjs') {
      output(await combineMjsFiles(cwd));
      return 0;
    }
    if (command === 'review') {
      await review(cwd, { write: (value) => output(value) });
      return 0;
    }
    throw new Error(`Unknown command: ${command}`);
  } catch (cause) {
    error(`codescope: ${cause.message}`);
    error('Run "codescope --help" for usage.');
    return 2;
  }
}

export { VERSION };
