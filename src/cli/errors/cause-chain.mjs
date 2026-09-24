export function errorChainText(cause) {
  const messages = [];
  const visited = new Set();
  for (let current = cause; current && !visited.has(current); current = current.cause) {
    visited.add(current);
    if (current instanceof Error || typeof current?.message === "string")
      messages.push(current.message);
  }
  return messages.join(" ");
}

export function errorChainHasCode(cause, code) {
  const visited = new Set();
  for (let current = cause; current && !visited.has(current); current = current.cause) {
    visited.add(current);
    if (current.code === code) return true;
  }
  return false;
}
