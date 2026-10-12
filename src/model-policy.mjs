import { API_PRICING } from "@eliware/openai";

const MODELS = Object.keys(API_PRICING);

export function validateModel(model) {
  if (model && !MODELS.includes(model))
    throw new Error(`Model must be one of: ${MODELS.join(", ")}`);
}
