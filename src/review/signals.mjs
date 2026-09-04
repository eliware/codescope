export function registerReviewSignals(register, controller) {
  try {
    return register({
      exit: false,
      signal: controller.signal,
      shutdownHook: () => controller.abort(),
    });
  } catch (cause) {
    throw new Error(
      `Unable to register signal handlers: ${cause instanceof Error ? cause.message : String(cause)}`,
      { cause },
    );
  }
}
