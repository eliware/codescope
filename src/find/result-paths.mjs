export function relativeResultPath(pathApi, scanRoot, directory, name) {
  return pathApi.relative(scanRoot, pathApi.join(directory, name)).split(/[\\/]/u).join('/');
}

export function sortResultPaths(results) {
  return results.sort();
}
