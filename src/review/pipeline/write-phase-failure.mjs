import { throwSessionFailure } from "../review-failure.mjs";

export function writePhaseFailure({ cause, createFailure }) {
  return throwSessionFailure({ cause, createFailure });
}

export async function runReviewPhase(action, failureOptions = {}) {
  try {
    return await action();
  } catch (cause) {
    return writePhaseFailure({ ...failureOptions, cause });
  }
}
