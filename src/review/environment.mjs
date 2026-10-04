import process from "node:process";
import { loadEnvironmentFile } from "./environment/load-environment-file.mjs";
import { resolveTokenEnvironment } from "./environment/resolve-provider-environment.mjs";

export async function loadReviewEnvironment({
  envFile,
  envFileExplicit,
  openEnvFile,
  inspectFile,
  environment = process.env,
}) {
  const processEnvironment = resolveTokenEnvironment({}, environment);
  if (processEnvironment.OPENAI_API_TOKEN) return processEnvironment;
  const fileEnvironment = await loadEnvironmentFile({
    envFile,
    envFileExplicit,
    openEnvFile,
    inspectFile,
  });
  return resolveTokenEnvironment(fileEnvironment, environment);
}
export { resolveTokenEnvironment } from "./environment/resolve-provider-environment.mjs";
