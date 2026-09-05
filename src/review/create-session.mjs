import { prepareReviewRequest } from './request-phase.mjs';

export function createReviewSession({ prompt, combined, model, plainText }) {
  return {
    request: prepareReviewRequest(prompt, combined, model, plainText),
    controller: new AbortController(),
  };
}
