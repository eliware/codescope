export function resolveTokenEnvironment(fileEnvironment, environment) {
  const processValue = environment.OPENAI_API_TOKEN;
  const fileValue = fileEnvironment.OPENAI_API_TOKEN;
  const processToken = typeof processValue === 'string' ? processValue.trim() : '';
  const fileToken = typeof fileValue === 'string' ? fileValue.trim() : '';
  if (processToken) return { OPENAI_API_TOKEN: processToken };
  if (fileToken) return { OPENAI_API_TOKEN: fileToken };
  return {};
}
