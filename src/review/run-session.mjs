import { runDrySession } from './session/run-dry-session.mjs';
import { runProviderAndWrite } from './session/run-provider-and-write.mjs';
import { throwSessionFailure } from './session-failure.mjs';

export async function runReviewSession({
  client,
  request,
  signal,
  write,
  dryRun,
  usage,
  plainText,
}) {
  let providerResponse;
  let providerResponseReceived = false;
  try {
    if (dryRun) {
      return await runDrySession({ client, request, signal, write, usage });
    }
    const session = await runProviderAndWrite({
      client,
      request,
      signal,
      usage,
      plainText,
      write,
    });
    providerResponse = session.providerResponse;
    providerResponseReceived = true;
    return session;
  } catch (cause) {
    providerResponse ??= cause.providerResponse;
    providerResponseReceived ||= providerResponse !== undefined;
    return throwSessionFailure({ cause, providerResponse, providerResponseReceived, write });
  }
}
