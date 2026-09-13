import { withReviewUsage } from './usage.mjs';

export function reviewSessionResult(providerResponse, request, model, usage, parse) {
  const result = parse(providerResponse, request);
  return withReviewUsage(result, providerResponse, model, usage);
}
