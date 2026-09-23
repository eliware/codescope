import { requestProviderResponse } from '../provider-request.mjs';
import { responseText } from '../../response/provider-text.mjs';
import { createSessionResult } from '../session-result.mjs';

export async function runProviderSession({ client, request, signal, plainText }) {
  const providerResponse = await requestProviderResponse(client, request, signal);
  let output;
  try {
    output = responseText(providerResponse, request);
  } catch (cause) {
    cause.providerResponse = providerResponse;
    throw cause;
  }
  return createSessionResult(
    plainText === undefined ? 'review' : 'prompt',
    output,
    providerResponse,
  );
}
