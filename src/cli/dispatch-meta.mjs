import { usage } from './help.mjs';
import { VERSION } from './version.mjs';

export function dispatchMeta(command, option, output, additions = []) {
  if (!Array.isArray(additions)) throw new TypeError('Meta-command additions must be an array');
  // Additions are normalized for every command but intentionally have no effect on meta output.
  if (option && ['--help', '-h'].includes(option)) {
    output(usage());
    return true;
  }
  if (option === '--version' || option === '-v') {
    output(VERSION);
    return true;
  }
  if (command === 'help') {
    output(usage());
    return true;
  }
  if (command === 'version') {
    output(VERSION);
    return true;
  }
  return false;
}
