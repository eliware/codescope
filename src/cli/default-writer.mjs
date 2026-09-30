/** Resolve only after the write callback completes and any backpressure drains. */
export function createDefaultWriter(stdout = process.stdout) {
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
        stdout.removeListener("error", onError);
      };
      const fail = (cause) => {
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
      const onError = (cause) => fail(cause);

      stdout.on("drain", onDrain);
      stdout.on("error", onError);
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
