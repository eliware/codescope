import { API_PRICING } from './models.mjs';
import {
  CACHE_WRITE_MULTIPLIER,
  LONG_CONTEXT_INPUT_MULTIPLIERS,
  LONG_CONTEXT_INPUT_THRESHOLD,
} from './thresholds.mjs';
import { normalizeUsage } from './usage-normalizer.mjs';

const MILLION = 1_000_000;
export { API_PRICING } from './models.mjs';
export {
  CACHE_WRITE_MULTIPLIER,
  LONG_CONTEXT_INPUT_MULTIPLIERS,
  LONG_CONTEXT_INPUT_THRESHOLD,
} from './thresholds.mjs';
export { normalizeUsage } from './usage-normalizer.mjs';

export function calculateUsageCostBreakdown(model, usage) {
  const rates = API_PRICING[model];
  if (!rates) throw new Error(`Unknown pricing model: ${model}`);
  const { input, cachedInput, cacheWrite, output } = normalizeUsage(usage);
  const longContext = input > LONG_CONTEXT_INPUT_THRESHOLD;
  const inputMultiplier = longContext ? LONG_CONTEXT_INPUT_MULTIPLIERS.input : 1;
  const outputMultiplier = longContext ? LONG_CONTEXT_INPUT_MULTIPLIERS.output : 1;
  const uncachedInput = Math.max(0, input - cachedInput - cacheWrite);
  const uncachedCost = (uncachedInput * rates.input * inputMultiplier) / MILLION;
  const cachedCost = (cachedInput * rates.cachedInput * inputMultiplier) / MILLION;
  const cacheWriteCost =
    (cacheWrite * rates.input * CACHE_WRITE_MULTIPLIER * inputMultiplier) / MILLION;
  const outputCost = (output * rates.output * outputMultiplier) / MILLION;
  const estimatedCost = uncachedCost + cachedCost + cacheWriteCost + outputCost;
  return {
    input_tokens: input,
    cached_tokens: cachedInput,
    cache_write_tokens: cacheWrite,
    output_tokens: output,
    uncached_input_cost_usd: Number(uncachedCost.toFixed(6)),
    cached_input_cost_usd: Number(cachedCost.toFixed(6)),
    cache_write_cost_usd: Number(cacheWriteCost.toFixed(6)),
    output_cost_usd: Number(outputCost.toFixed(6)),
    estimated_cost_usd: Number(estimatedCost.toFixed(6)),
  };
}

export function calculateUsageCost(model, usage) {
  return calculateUsageCostBreakdown(model, usage).estimated_cost_usd;
}
