import { validatePromptShape } from "./prompt-shape.mjs";
import { prepareAllowedRequestFields } from "./request/prepare-allowed-fields.mjs";
import { attachRepositoryEvidence } from "./request/attach-repository-evidence.mjs";

export function prepareRequest(prompt, combined) {
  validatePromptShape(prompt);
  const request = prepareAllowedRequestFields(prompt);
  return attachRepositoryEvidence(request, combined);
}
