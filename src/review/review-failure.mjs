import { createProviderFailure } from "./provider-failure.mjs";
import { attachProviderFailureDetails } from "./failure/attach-provider-failure-details.mjs";

export async function throwSessionFailure({ cause, createFailure = createProviderFailure }) {
  const failure = attachProviderFailureDetails(createFailure(cause), { cause });
  throw failure;
}
