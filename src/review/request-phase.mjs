import { prepareRequest } from './request.mjs';
import { preparePlainTextRequest } from './plain-text-request.mjs';

export function prepareReviewRequest(prompt, combined, model, plainText) {
  const request = prepareRequest(prompt, combined);
  if (model) request.model = model;
  if (plainText !== undefined) return preparePlainTextRequest(request, plainText, combined);
  return request;
}
