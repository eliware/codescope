import { removeSignalHandlers } from './cleanup.mjs';
import { registerReviewSignals } from './signals.mjs';

export async function finalizeReviewSession({ register, controller, execute }) {
  const signals = registerReviewSignals(register, controller);
  try {
    return await execute(controller.signal);
  } finally {
    controller.abort();
    removeSignalHandlers(signals);
  }
}
