export function removeSignalHandlers(signals) {
  try {
    if (signals && typeof signals.removeHandlers === 'function') signals.removeHandlers();
  } catch {}
}
