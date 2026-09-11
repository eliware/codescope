import { responseText } from '../response/provider-text.mjs';
import { parseJsonResult } from '../response/json-result.mjs';

export function parseProviderResult(providerResponse, request) {
  return parseJsonResult(responseText(providerResponse, request));
}
