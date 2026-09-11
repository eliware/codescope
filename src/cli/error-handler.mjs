import { errorExitCode } from './errors.mjs';

export async function runWithCliErrors(operation, error = console.error) {
  try {
    return await operation();
  } catch (cause) {
    error(`codescope: ${cause instanceof Error ? cause.message : String(cause)}`);
    if (cause instanceof Error && cause.message.startsWith('Unknown command'))
      error('Run "codescope --help" for usage.');
    return errorExitCode(cause);
  }
}
