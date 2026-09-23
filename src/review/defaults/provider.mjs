import { createOpenAI } from '@eliware/openai';

export function createProviderDefaults() {
  return { createClient: createOpenAI };
}
