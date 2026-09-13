export function assertNotSymbolicLink(envFile, metadata) {
  if (typeof metadata?.isSymbolicLink !== 'function')
    throw new Error(`${envFile} inspection did not provide symbolic-link metadata`);
  if (metadata.isSymbolicLink()) throw new Error(`${envFile} must not be a symbolic link`);
}

export function fileIdentity(envFile, metadata) {
  const { dev, ino } = metadata ?? {};
  const valid = (value) => typeof value === 'number' || typeof value === 'bigint';
  if (!valid(dev) || !valid(ino))
    throw new Error(`${envFile} inspection did not provide stable file identity`);
  return `${dev}:${ino}`;
}
