export function createSessionResult(kind, output, providerResponse) {
  return {
    kind,
    output,
    ...(providerResponse === undefined ? {} : { providerResponse }),
  };
}
