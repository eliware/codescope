const MILLION = 1_000_000;

export const API_PRICING = Object.freeze({
  'gpt-5.6-luna': Object.freeze({ input: 0.2, cachedInput: 0.02, output: 1.2 }),
  'gpt-5.6-terra': Object.freeze({ input: 2, cachedInput: 0.2, output: 12 }),
  'gpt-5.6-sol': Object.freeze({ input: 4, cachedInput: 0.4, output: 20 }),
});

export const LONG_CONTEXT_INPUT_THRESHOLD = 272_000;
export const LONG_CONTEXT_INPUT_MULTIPLIERS = Object.freeze({ input: 2, output: 1.5 });
export const CACHE_WRITE_MULTIPLIER = 1.25;

export function calculateUsageCost(model, usage) {
  const rates = API_PRICING[model];
  if (!rates) throw new Error(`Unknown pricing model: ${model}`);
  const input = usage?.input_tokens ?? 0;
  const cachedInput = usage?.input_tokens_details?.cached_tokens ?? 0;
  const cacheWrite = usage?.input_tokens_details?.cache_write_tokens ?? 0;
  const output = usage?.output_tokens ?? 0;
  const longContext = input > LONG_CONTEXT_INPUT_THRESHOLD;
  const inputMultiplier = longContext ? LONG_CONTEXT_INPUT_MULTIPLIERS.input : 1;
  const outputMultiplier = longContext ? LONG_CONTEXT_INPUT_MULTIPLIERS.output : 1;
  const uncachedInput = Math.max(0, input - cachedInput - cacheWrite);
  const cost =
    (uncachedInput * rates.input * inputMultiplier +
      cachedInput * rates.cachedInput * inputMultiplier +
      cacheWrite * rates.input * CACHE_WRITE_MULTIPLIER * inputMultiplier +
      output * rates.output * outputMultiplier) /
    MILLION;
  return Number(cost.toFixed(6));
}
