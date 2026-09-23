export function createDefaultWriter(stdout = process.stdout) {
  return (value) => new Promise((resolve, reject) => {
    stdout.write(value, (cause) => {
      if (cause) reject(cause);
      else resolve({ written: value.length });
    });
  });
}
