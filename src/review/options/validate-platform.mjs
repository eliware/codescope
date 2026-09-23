const supportedPlatforms = new Set(['linux', 'darwin', 'freebsd', 'win32']);

export function validateReviewPlatform({ cwd, envFile, platform, environment }) {
  if (typeof cwd !== 'string' || !cwd)
    throw new Error('runReview cwd must be a non-empty path string');
  if (envFile !== undefined && (typeof envFile !== 'string' || !envFile))
    throw new Error('runReview option envFile must be a non-empty string');
  if (platform !== undefined && !supportedPlatforms.has(platform))
    throw new Error(`runReview option platform is unsupported: ${platform}`);
  if (!environment || typeof environment !== 'object' || Array.isArray(environment))
    throw new Error('runReview option environment must be an object');
}
