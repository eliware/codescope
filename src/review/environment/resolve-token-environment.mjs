export function resolveTokenEnvironment(fileEnvironment, environment) {
  const processToken = environment.OPENAI_API_TOKEN;
  const fileToken = fileEnvironment.OPENAI_API_TOKEN;
  if (processToken?.trim()) return { OPENAI_API_TOKEN: processToken.trim() };
  if (fileToken?.trim()) return { OPENAI_API_TOKEN: fileToken.trim() };
  return {};
}
