import { combineSelectedFiles } from '../combine/all.mjs';

export function createProfileCombiner(profileFiles, mode) {
  const [implementation, tests, docs] = profileFiles;
  const reviewSources = mode === 'review';
  return (root, options) =>
    combineSelectedFiles(root, {
      ...options,
      implementation: reviewSources || implementation,
      tests: reviewSources || tests,
      docs: reviewSources || docs,
    });
}
