import { registerSignals } from '@eliware/common';

export function createLifecycleDefaults() {
  return { register: registerSignals, usage: false, dryRun: false, model: undefined };
}
