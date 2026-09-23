import { writeProviderResult } from './output/write-provider-output.mjs';
import { runDrySession } from './session/run-dry-session.mjs';
import { runProviderSession } from './session/run-provider-session.mjs';
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
    const session = await runProviderSession({
      client,
      request,
      signal,
      usage,
      plainText,
    });
    providerResponse = session.providerResponse;
    providerResponseReceived = true;
    await writeProviderResult(write, session.output, session.kind);
    return session;
  } catch (cause) {
    providerResponse ??= cause.providerResponse;
    providerResponseReceived ||= providerResponse !== undefined;
    return throwSessionFailure({ cause, providerResponse, providerResponseReceived, write });
  }
}
