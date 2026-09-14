const MODELS = ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol'];

export function validateModel(model) {
  if (model && !MODELS.includes(model))
    throw new Error(`Model must be one of: ${MODELS.join(', ')}`);
}
