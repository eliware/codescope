import { writeProviderResult } from '../output/write-provider-output.mjs';
import { runProviderSession } from './run-provider-session.mjs';

export async function runProviderAndWrite({ client, request, signal, usage, plainText, write }) {
  const session = await runProviderSession({ client, request, signal, usage, plainText });
  await writeProviderResult(write, session.output, session.kind);
  return session;
}
