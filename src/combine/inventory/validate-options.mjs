export function validateInventoryOptions(concurrency) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error("Other-file read concurrency must be a positive integer");
}
