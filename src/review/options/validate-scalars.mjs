import { validatePromptShape } from '../prompt-shape.mjs';
import { validateModel } from '../../model-policy.mjs';

export function validateReviewScalars({ maxSourceChars, model, plainText, add, usage, dryRun, prompt }) {
  if (maxSourceChars !== Infinity && (!Number.isFinite(maxSourceChars) || !Number.isInteger(maxSourceChars) || maxSourceChars < 1))
    throw new Error('runReview maxSourceChars must be a positive integer or Infinity');
  if (model !== undefined && (typeof model !== 'string' || !model.trim()))
    throw new Error('Model must be a supported model string');
  if (model !== undefined) {
    try { validateModel(model); } catch { throw new Error('Model must be a supported model string'); }
  }
  if (plainText !== undefined && (typeof plainText !== 'string' || !plainText.trim()))
    throw new Error('runReview option plainText must be a non-empty string');
  if (add !== undefined && (!Array.isArray(add) || !add.every((value) => typeof value === 'string' && value.trim())) )
    throw new Error('runReview option add must be an array of strings');
  if (plainText !== undefined && (dryRun || usage))
    throw new Error('runReview option plainText cannot be combined with dryRun or usage');
  for (const [name, value] of Object.entries({ usage, dryRun }))
    if (value !== undefined && typeof value !== 'boolean')
      throw new Error(`runReview option ${name} must be a boolean`);
  if (prompt !== undefined) validatePromptShape(prompt);
}
