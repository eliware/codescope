import { validateEffort } from '../option-validation.mjs';
import { validateModel } from '../../model-policy.mjs';

export function isPromptScalarOption(value) {
  if (value.startsWith('--effort=')) {
    try { validateEffort(value.slice('--effort='.length)); return true; } catch { return false; }
  }
  if (value.startsWith('--model=')) {
    try { validateModel(value.slice('--model='.length)); return true; } catch { return false; }
  }
  return false;
}
