/** Resolve only after the write callback completes and any backpressure drains. */
const writers = new WeakMap();

export function createDefaultWriter(stdout = process.stdout) {
  const existing = writers.get(stdout);
  if (existing) return existing;
  const writer = createWriter(stdout);
  writers.set(stdout, writer);
  return writer;
}

function createWriter(stdout) {
  const pendingFailures = new Set();
  stdout.on("error", (cause) => {
    for (const fail of pendingFailures) fail(cause);
  });

  return (value) =>
    new Promise((resolve, reject) => {
      let callbackComplete = false;
      let callbackError;
      let waitingForDrain = false;
      let drainSeen = false;
      let writeReturned = false;
      let settled = false;

      const cleanup = () => {
        stdout.removeListener("drain", onDrain);
        pendingFailures.delete(fail);
      };
      const fail = (cause) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(cause);
      };
      const complete = () => {
        if (settled || !writeReturned) return;
        if (callbackError) {
          fail(callbackError);
          return;
        }
        if (!callbackComplete || waitingForDrain) return;
        settled = true;
        cleanup();
        resolve({ written: value.length });
      };
      const onDrain = () => {
        drainSeen = true;
        waitingForDrain = false;
        complete();
      };
      pendingFailures.add(fail);
      stdout.on("drain", onDrain);
      try {
        const accepted = stdout.write(value, (cause) => {
          if (cause) {
            callbackError = cause;
          } else {
            callbackComplete = true;
          }
          complete();
        });
        writeReturned = true;
        waitingForDrain = accepted === false && !drainSeen;
        complete();
      } catch (cause) {
        fail(cause);
      }
    });
}
