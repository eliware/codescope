/** Resolve only after the write callback completes and any backpressure drains. */
export function createDefaultWriter(stdout = process.stdout) {
  return (value) => new Promise((resolve, reject) => {
    let callbackComplete = false;
    let waitingForDrain = false;
    let drainSeen = false;
    let writeReturned = false;
    let settled = false;

    const cleanup = () => {
      stdout.removeListener('drain', onDrain);
      stdout.removeListener('error', onError);
    };
    const fail = (cause) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(cause);
    };
    const complete = () => {
      if (settled || !writeReturned || !callbackComplete || waitingForDrain) return;
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

    stdout.on('drain', onDrain);
    stdout.on('error', onError);
    try {
      const accepted = stdout.write(value, (cause) => {
        if (cause) {
          fail(cause);
          return;
        }
        callbackComplete = true;
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
