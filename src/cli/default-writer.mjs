/**
 * Create a writer that resolves after stdout accepts the complete string.
 * The result reports JavaScript character count; stream backpressure is
 * handled by the completion callback and is not exposed at this CLI boundary.
 */
export function createDefaultWriter(stdout = process.stdout) {
  return (value) => new Promise((resolve, reject) => {
    stdout.write(value, (cause) => {
      if (cause) reject(cause);
      else resolve({ written: value.length });
    });
  });
}
