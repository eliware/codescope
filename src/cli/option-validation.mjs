const EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'];
const MODELS = ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'];

export function validateEffort(effort) {
  if (effort && !EFFORTS.includes(effort))
    throw new Error(`Effort must be one of: ${EFFORTS.join(', ')}`);
}

export function validateModel(model) {
  if (model && !MODELS.includes(model))
    throw new Error(`Model must be one of: ${MODELS.join(', ')}`);
}
