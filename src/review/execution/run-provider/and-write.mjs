import { writeProviderResult } from "../../output/write-provider-output.mjs";
import { runProviderSession } from "./review.mjs";

export async function runProviderAndWrite({
  client,
  request,
  signal,
  usage,
  plainText,
  write,
  debugRequest,
}) {
  const session = await runProviderSession({
    client,
    request,
    signal,
    usage,
    plainText,
    debugRequest,
  });
  await writeProviderResult(write, session.output, session.kind);
  return session;
}
