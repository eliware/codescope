import { runDrySession } from "./execution/run-dry-review.mjs";
import { runProviderAndWrite } from "./execution/run-provider-and-write.mjs";
import { throwSessionFailure } from "./review-failure.mjs";

export async function runReviewSession({
  client,
  request,
  signal,
  write,
  dryRun,
  usage,
  plainText,
  debugRequest,
}) {
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
      debugRequest,
      write,
    });
    return session;
  } catch (cause) {
    return throwSessionFailure({ cause });
  }
}
