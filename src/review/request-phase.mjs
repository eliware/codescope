import { prepareRequest } from './request.mjs';
import { preparePlainTextRequest } from './plain-text-request.mjs';
import { appendUserMessages } from '../prompts/append-user-message.mjs';

export function prepareReviewRequest(prompt, combined, model, plainText, additions = []) {
  const request = prepareRequest(prompt, combined);
  if (model) request.model = model;
  const prepared = plainText !== undefined ? preparePlainTextRequest(request, plainText, combined) : request;
  return appendUserMessages(prepared, additions);
}
