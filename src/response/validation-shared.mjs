import { exactKeys } from './exact-keys.mjs';

export const toolCategories = (prompt, field) =>
  Object.keys(prompt?.tools?.[0]?.parameters?.properties?.[field]?.properties ?? {});

export const validIgnore = (value) =>
  typeof value === 'string' && /^\/\/ codescope ignore: [^\r\n]+$/u.test(value);

export { exactKeys };
