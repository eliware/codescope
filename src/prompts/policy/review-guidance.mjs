import { identityPolicy } from './identity.mjs';
import { contractPolicy } from './contract.mjs';
import { priorityPolicy } from './priorities.mjs';
import { scopePolicy } from './scope.mjs';
import { transportPolicy } from './transport.mjs';
import { evidencePolicy } from './evidence.mjs';

export const ceoPriorityGuidance = [
  identityPolicy, contractPolicy, priorityPolicy, scopePolicy, transportPolicy,
].join('\n\n');

export const globalReviewInstructions = `${ceoPriorityGuidance}\n\n${evidencePolicy}\n\nAssume the repository's full test suite passes unless concrete failing-test evidence is supplied. Review supplied test files for contract coverage, but do not require test-run output or infer an unobserved test failure.`;
