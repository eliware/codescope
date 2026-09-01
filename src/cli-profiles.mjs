import { combineAllFiles, combineSelectedFiles } from './combine-all.mjs';
import { createAnalysisPrompt, allPrompt, refactorPrompt, architecturePrompt, newFeaturesPrompt, securityPrompt, performancePrompt, reliabilityPrompt, apiDesignPrompt, dependenciesPrompt, observabilityPrompt, accessibilityPrompt, releasePrompt, quickWinsPrompt, prioritizePrompt } from './prompt.mjs';

const PROFILE_FILES = {
  implementation: [true, false, false],
  'implementation-docs': [true, false, true],
  'implementation-tests': [true, true, false],
  refactor: [true, false, false],
  architecture: [true, false, false],
  'new-features': [true, false, false],
  'implementation-tests-docs': [true, true, true],
  security: [true, false, false],
  performance: [true, false, false],
  reliability: [true, false, false],
  'api-design': [true, false, false],
  dependencies: [true, false, false],
  observability: [true, false, false],
  accessibility: [true, false, false],
  release: [true, false, false],
  'quick-wins': [true, false, false],
  prioritize: [true, false, false],
  tests: [false, true, false],
  'tests-docs': [false, true, true],
  docs: [false, false, true],
};

export function getProfile(profile) {
  if (!Object.hasOwn(PROFILE_FILES, profile)) throw new Error(`Unknown analysis profile: ${profile}`);
  const [implementation, tests, docs] = PROFILE_FILES[profile];
  const combine = profile === 'implementation-tests-docs' ? combineAllFiles : (root, options) => combineSelectedFiles(root, { ...options, implementation, tests, docs });
  const subject = profile === 'docs' ? 'the documentation for inconsistencies' : profile === 'tests' ? 'the test suite for test quality and coverage; do not report the absence of implementation files' : 'the selected implementation and test files for issues';
  const prompts = { 'implementation-tests-docs': allPrompt, refactor: refactorPrompt, architecture: architecturePrompt, 'new-features': newFeaturesPrompt, security: securityPrompt, performance: performancePrompt, reliability: reliabilityPrompt, 'api-design': apiDesignPrompt, dependencies: dependenciesPrompt, observability: observabilityPrompt, accessibility: accessibilityPrompt, release: releasePrompt, 'quick-wins': quickWinsPrompt, prioritize: prioritizePrompt };
  const prompt = prompts[profile] ?? createAnalysisPrompt(subject);
  return { combine, prompt };
}
