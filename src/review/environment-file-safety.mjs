export function assertNotSymbolicLink(envFile, metadata) {
  if (typeof metadata?.isSymbolicLink !== "function")
    throw new Error(`${envFile} inspection did not provide symbolic-link metadata`);
  if (metadata.isSymbolicLink()) throw new Error(`${envFile} must not be a symbolic link`);
}

export function assertRegularFile(envFile, metadata) {
  if (typeof metadata?.isFile !== "function")
    throw new Error(`${envFile} inspection did not provide regular-file metadata`);
  if (!metadata.isFile()) throw new Error(`${envFile} must be a regular file`);
}
