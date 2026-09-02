import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import { combineMjsFiles } from './combine-mjs.mjs';
import { prompt as defaultPrompt } from './prompt.mjs';
import { defaultEnvFile, loadEnv } from './review-config.mjs';
import { lstat, stat } from 'node:fs/promises';
import { parseReviewToolResponse } from './review-response.mjs';
import { prepareRequest } from './review-request.mjs';
import { removeSignalHandlers } from './review-cleanup.mjs';

const PLACEHOLDER = '<combine-mjs here>';

export async function runReview(cwd, options) {
  const defaults = {
    write: process.stdout.write.bind(process.stdout),
    readFile: fs.promises.readFile,
    envFile: defaultEnvFile(),
    prompt: defaultPrompt,
    combine: combineMjsFiles,
    maxSourceChars: 2_000_000,
    usage: false,
    createClient: createOpenAI,
    register: registerSignals,
    inspectFile: lstat,
    inspectPermissions: stat,
  };
  const {
    write,
    readFile,
    readEnvFile = readFile,
    readDirectory,
    envFile,
    prompt,
    combine,
    maxSourceChars,
    usage,
    createClient,
    register,
    inspectFile,
    inspectPermissions,
  } = { ...defaults, ...options };
  const environment = { ...process.env };
  let envText = '';

  if (readEnvFile === readFile && envFile === defaultEnvFile()) {
    try {
      const metadata = await inspectFile(envFile);
      if (metadata.isSymbolicLink()) throw new Error('~/.codescope must not be a symbolic link');
    } catch (cause) {
      if (cause?.code !== 'ENOENT')
        throw new Error(
          `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
    }
  }

  try {
    envText = await readEnvFile(envFile, 'utf8');
  } catch (cause) {
    if (cause?.code !== 'ENOENT')
      throw new Error(
        `Unable to read ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
  }

  if (readEnvFile === readFile && envFile === defaultEnvFile() && process.platform !== 'win32') {
    try {
      const metadata = await inspectPermissions(envFile);
      if ((metadata.mode & 0o077) !== 0)
        throw new Error('~/.codescope must not be readable by group or other users');
    } catch (cause) {
      if (cause?.code === 'ENOENT') {
      } else if (cause?.message?.includes('must not be readable')) throw cause;
      else
        throw new Error(
          `Unable to inspect ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
    }
  }
  loadEnv(envText, environment);
  const combined = await combine(cwd, {
    readDirectory,
    readFileContents: readFile,
    validateSymlinks: readFile === fs.promises.readFile,
    maxChars: maxSourceChars,
  });

  const request = prepareRequest(prompt, combined);

  const token = environment.OPENAI_API_TOKEN?.trim();
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from ~/.codescope or the environment');
  const controller = new AbortController();
  let client;

  try {
    client = createClient({ apiKey: token });
  } catch (cause) {
    throw new Error('Unable to initialize OpenAI client', { cause });
  }
  let signals;
  try {
    try {
      signals = register({
        exit: false,
        signal: controller.signal,
        shutdownHook: () => controller.abort(),
      });
    } catch (cause) {
      throw new Error(
        `Unable to register signal handlers: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
    }
    try {
      const toolName = request.tool_choice?.name ?? 'submit_review';
      const response = await client.responses.create({
        ...request,
        input: request.input,
        tool_choice: { type: 'function', name: toolName },
        parallel_tool_calls: false,
      });
      const schemaCategories = Object.keys(
        request.tools?.[0]?.parameters?.properties?.issues?.properties ??
          request.tools?.[0]?.parameters?.properties?.suggestions?.properties ??
          {},
      );
      const categories = schemaCategories.length ? schemaCategories : undefined;
      const result = parseReviewToolResponse(response, toolName, categories);
      const output = usage ? { ...result, usage: response.usage ?? null } : result;

      try {
        await write(`${JSON.stringify(output, null, 2)}\n`);
      } catch (cause) {
        throw new Error(
          `Unable to write review output: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
      }
    } catch (cause) {
      const failure = new Error(
        `OpenAI request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
      throw failure;
    }
  } finally {
    try {
      controller.abort();
    } catch {}

    try {
      removeSignalHandlers(signals);
    } catch {}
  }
}
