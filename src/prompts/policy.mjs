import { identityPolicy } from './policy/identity.mjs';
import { contractPolicy } from './policy/contract.mjs';
import { priorityPolicy } from './policy/priorities.mjs';
import { scopePolicy } from './policy/scope.mjs';
import { transportPolicy } from './policy/transport.mjs';
import { evidencePolicy } from './policy/evidence.mjs';

export const ceoPriorityGuidance = [
  identityPolicy,
  contractPolicy,
  priorityPolicy,
  scopePolicy,
  transportPolicy,
].join('\n\n');

export const globalReviewInstructions = `${ceoPriorityGuidance}\n\n${evidencePolicy}`;
