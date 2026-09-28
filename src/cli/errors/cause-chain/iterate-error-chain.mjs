export function* iterateErrorChain(cause) {
  const visited = new Set();
  for (let current = cause; current && !visited.has(current); current = current.cause) {
    visited.add(current);
    yield current;
  }
}
