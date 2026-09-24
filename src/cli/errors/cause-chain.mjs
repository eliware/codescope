export function errorChainText(cause) {
  const messages = [];
  for (let current = cause; current; current = current.cause)
    if (current instanceof Error || typeof current?.message === "string")
      messages.push(current.message);
  return messages.join(" ");
}

export function errorChainHasCode(cause, code) {
  for (let current = cause; current; current = current.cause)
    if (current.code === code) return true;
  return false;
}
