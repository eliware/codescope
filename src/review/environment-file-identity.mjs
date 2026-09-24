export function fileIdentity(envFile, metadata) {
  const { dev, ino } = metadata ?? {};
  const valid = (value) => typeof value === "number" || typeof value === "bigint";
  if (!valid(dev) || !valid(ino))
    throw new Error(`${envFile} inspection did not provide stable file identity`);
  const normalize = (value) =>
    typeof value === "bigint"
      ? value.toString()
      : Number.isSafeInteger(value)
        ? BigInt(value).toString()
        : `number:${value}`;
  return `${normalize(dev)}:${normalize(ino)}`;
}
