import { identityPolicy } from "./identity.mjs";
import { contractPolicy } from "./contract.mjs";
import { priorityPolicy } from "./priorities.mjs";
import { scopePolicy } from "./scope.mjs";
import { transportPolicy } from "./transport.mjs";
import { evidencePolicy } from "./evidence.mjs";

export const ceoPriorityGuidance = [
  identityPolicy,
  contractPolicy,
  priorityPolicy,
  scopePolicy,
  transportPolicy,
].join("\n\n");

export const globalReviewInstructions = `${ceoPriorityGuidance}\n\n${evidencePolicy}\n\nThe request states that all npm tests passed 100%. Treat this as the supplied test status. CodeScope does not run tests. Review supplied tests for the behavior they check. Do not claim that a test failed unless this request supplies that result.`;
