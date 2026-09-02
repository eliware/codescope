import { combineAllFiles, combineSelectedFiles } from './combine-all.mjs';
import {
  createAnalysisPrompt,
  mdPrompt,
  allPrompt,
  codeTestsDocsPrompt,
  refactorPrompt,
  architecturePrompt,
  newFeaturesPrompt,
  securityPrompt,
  performancePrompt,
  reliabilityPrompt,
  apiDesignPrompt,
  dependenciesPrompt,
  observabilityPrompt,
  accessibilityPrompt,
  quickWinsPrompt,
  prioritizePrompt,
  priorityPrompt,
  createReviewTool,
  createSuggestionTool,
  REVIEW_CATEGORIES,
} from './prompt.mjs';

const PROFILE_FILES = {
  code: [true, false, false],
  'code-docs': [true, false, true],
  'code-tests': [true, true, false],
  refactor: [true, false, false],
  architecture: [true, false, false],
  'new-features': [true, false, false],
  'code-tests-docs': [true, true, true],
  all: [true, true, true],
  security: [true, false, false],
  performance: [true, false, false],
  reliability: [true, false, false],
  'api-design': [true, false, false],
  dependencies: [true, false, false],
  observability: [true, false, false],
  accessibility: [true, false, false],

  'quick-wins': [true, false, false],
  prioritize: [true, false, false],
  p0: [true, false, false],
  'p0-1': [true, false, false],
  'p0-2': [true, false, false],
  'p0-3': [true, false, false],
  tests: [false, true, false],
  'tests-docs': [false, true, true],
  docs: [false, false, true],
};

export function getProfile(profile, mode = 'review') {
  if (!Object.hasOwn(PROFILE_FILES, profile))
    throw new Error(`Unknown analysis profile: ${profile}`);
  const [implementation, tests, docs] = PROFILE_FILES[profile];
  const combine =
    profile === 'code-tests-docs'
      ? combineAllFiles
      : (root, options) => combineSelectedFiles(root, { ...options, implementation, tests, docs });

  const subject =
    profile === 'docs'
      ? 'the documentation for inconsistencies only'
      : profile === 'tests'
        ? 'the test suite for test quality and coverage only; do not report the absence of implementation files'
        : profile === 'code-docs'
          ? 'the selected code and Markdown files, reporting code/documentation inconsistencies only'
          : profile === 'tests-docs'
            ? 'the selected test and Markdown files for test/documentation inconsistencies only'
            : profile === 'code-tests'
              ? 'the selected code and test files for implementation/test inconsistencies and actionable issues'
              : 'the selected code files for actionable implementation issues';
  const prompts = {
    code: createAnalysisPrompt(subject),
    'code-docs': createAnalysisPrompt(subject),
    'code-tests': createAnalysisPrompt(subject),
    docs: mdPrompt,
    'code-tests-docs': codeTestsDocsPrompt,
    all: allPrompt,
    refactor: refactorPrompt,
    architecture: architecturePrompt,
    'new-features': newFeaturesPrompt,
    security: securityPrompt,
    performance: performancePrompt,
    reliability: reliabilityPrompt,
    'api-design': apiDesignPrompt,
    dependencies: dependenciesPrompt,
    observability: observabilityPrompt,
    accessibility: accessibilityPrompt,
    'quick-wins': quickWinsPrompt,
    prioritize: prioritizePrompt,
    p0: priorityPrompt(0),
    'p0-1': priorityPrompt(1),
    'p0-2': priorityPrompt(2),
    'p0-3': priorityPrompt(3),
  };
  const prompt = structuredClone(prompts[profile] ?? createAnalysisPrompt(subject));
  const suggestionCategories = {
    refactor: ['architecture'],
    architecture: ['architecture'],
    'new-features': ['architecture'],
    security: ['security'],
    performance: ['performance'],
    reliability: ['reliability'],
    'api-design': ['api_design'],
    dependencies: ['reliability'],
    observability: ['reliability'],
    accessibility: ['correctness'],
    'quick-wins': REVIEW_CATEGORIES,
    prioritize: REVIEW_CATEGORIES,
  }[profile];
  const reviewCategories =
    profile === 'all' || profile === 'code-tests-docs'
      ? REVIEW_CATEGORIES
      : { docs: ['documentation'], 'tests-docs': ['tests', 'documentation'] }[profile];
  if (mode === 'suggest') {
    const tool = createSuggestionTool(suggestionCategories ?? REVIEW_CATEGORIES);
    prompt.tools = [tool];
    prompt.tool_choice = { type: 'function', name: tool.name };
  } else if (reviewCategories) {
    const tool = createReviewTool(reviewCategories);
    prompt.tools = [tool];
    prompt.tool_choice = { type: 'function', name: tool.name };
  }
  return { combine, prompt };
}
