import { createReviewSession } from '../create-session.mjs';

export function createRequest(options, combined) {
  return createReviewSession({ prompt: options.prompt, combined, model: options.model, plainText: options.plainText, add: options.add });
}
