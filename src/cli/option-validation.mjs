const EFFORTS = ['none', 'low', 'medium', 'high', 'xhigh', 'max'];
import { validateModel } from '../model-policy.mjs';

export function validateEffort(effort) {
  if (effort && !EFFORTS.includes(effort))
    throw new Error(`Effort must be one of: ${EFFORTS.join(', ')}`);
}

export { validateModel };
