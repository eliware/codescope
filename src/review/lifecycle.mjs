import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import { combineMjsFiles } from '../combine/files.mjs';
import { prompt as defaultPrompt } from '../prompt.mjs';
import { defaultEnvFile } from './config.mjs';
import { lstat, stat } from 'node:fs/promises';
import { parseCombinedToolResponse, parseReviewToolResponse } from '../response/review-response.mjs';
import { prepareRequest } from './request.mjs';
import { removeSignalHandlers } from './cleanup.mjs';
import { calculateUsageCost } from '../pricing/calculator.mjs';
import { collectTestResults, redactTestOutput, testEvidenceBlocks } from './test-results.mjs';
import { validateReviewOptions } from './options.mjs';
import { loadReviewEnvironment } from './environment.mjs';
import { collectReviewTestEvidence } from './test-evidence.mjs';
import { parsePlainTextJsonResponse, preparePlainTextRequest } from './plain-text.mjs';
export { collectTestResults, redactTestOutput, testEvidenceBlocks } from './test-results.mjs';

export async function runReview(cwd, options) {
  const defaults = {
    write: process.stdout.write.bind(process.stdout),
    readFile: fs.promises.readFile,
    envFile: defaultEnvFile(),
    prompt: defaultPrompt,
    combine: combineMjsFiles,
    maxSourceChars: 2_000_000,
    usage: false,
    dryRun: false,
    includesTests: false,
    omitTestResults: false,
    testTimeoutMs: 30_000,
    runTestCommand: collectTestResults,
    redactTestOutput,
    model: undefined,
    createClient: createOpenAI,
    register: registerSignals,
    inspectFile: lstat,
    inspectPermissions: stat,
    platform: process.platform,
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
    dryRun,
    includesTests,
    omitTestResults,
    testTimeoutMs,
    runTestCommand,
    redactTestOutput: redactOutput,
    model,
    plainText,
    createClient,
    register,
    inspectFile,
    inspectPermissions,
    platform,
  } = { ...defaults, ...options };
  validateReviewOptions(cwd, {
    maxSourceChars,
    testTimeoutMs,
    usage,
    dryRun,
    includesTests,
    omitTestResults,
    write,
    readFile,
    readEnvFile,
    combine,
    runTestCommand,
    redactOutput,
    createClient,
    register,
  });
  // codescope ignore: runReview intentionally exposes injected collaborators and caller-owned mode consistency for deterministic package tests.
  // Programmatic callers own the consistency of injected filesystem collaborators; the CLI uses the secure defaults.
  const environment = await loadReviewEnvironment({
    envFile,
    readFile,
    readEnvFile,
    inspectFile,
    inspectPermissions,
    platform,
  });
  const token = environment.OPENAI_API_TOKEN?.trim();
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from ~/.codescope or the environment');
  const testResults = await collectReviewTestEvidence({
    cwd,
    includesTests,
    omitTestResults,
    testTimeoutMs,
    runTestCommand,
    redactOutput,
  });
  const combined = await combine(cwd, {
    readDirectory,
    readFileContents: readFile,
    // Injected filesystem adapters are testable collaborators; native scans validate symlinks in the finder.
    validateSymlinks: readFile === fs.promises.readFile,
    maxChars: maxSourceChars,
    testResults,
  });

  const request = prepareRequest(prompt, combined);
  if (model) request.model = model;

  if (plainText !== undefined) {
    preparePlainTextRequest(request, plainText, combined);
  }

  const controller = new AbortController();
  let client;

  try {
    client = createClient({ apiKey: token });
  } catch (cause) {
    throw new Error('Unable to initialize OpenAI client', { cause });
  }
  let signals;
  let providerResponse;
  let providerResponseReceived = false;
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
    // codescope ignore: profile-specific runReview dispatch is covered by prompt-construction and injected-client tests; subprocess and every-profile integration duplication is intentionally out of scope.
    try {
      const toolNames = (request.tools ?? []).map((tool) => tool?.name);
      const combined =
        request.tool_choice === 'auto' &&
        toolNames.includes('submit_review') &&
        toolNames.includes('submit_suggestions');
      const toolName = request.tool_choice?.name ?? 'submit_review';
      // codescope ignore: streaming and async-iterable provider responses are intentionally unsupported; the request requires one complete structured response.
      if (dryRun) {
        const {
          store: _store,
          include: _include,
          prompt_cache_options: _cacheOptions,
          service_tier: _serviceTier,
          ...tokenRequest
        } = request;
        if (typeof client.responses?.inputTokens?.count !== 'function') {
          const error = new Error('OpenAI client does not support input-token counting');
          error.code = 'API';
          throw error;
        }
        const tokenResponse = await client.responses.inputTokens.count(tokenRequest, {
          signal: controller.signal,
        });
        if (!Number.isInteger(tokenResponse?.input_tokens) || tokenResponse.input_tokens < 0) {
          const error = new Error('Invalid input-token count response');
          error.code = 'INVALID_RESPONSE';
          throw error;
        }
        const output = {
          model: request.model,
          estimated_input_tokens: tokenResponse.input_tokens,
        };
        if (usage) {
          output.usage = {
            input_tokens: tokenResponse.input_tokens,
            estimated_cost_usd: calculateUsageCost(request.model ?? 'gpt-5.6-luna', {
              input_tokens: tokenResponse.input_tokens,
            }),
          };
        }
        await write(`${JSON.stringify(output, null, 2)}\n`);
        return output;
      }
      providerResponse = await client.responses.create(
        {
          ...request,
          input: request.input,
          tool_choice: request.tool_choice,
          parallel_tool_calls: combined,
        },
        { signal: controller.signal },
      );
      providerResponseReceived = true;
      if (plainText !== undefined) {
        const output = parsePlainTextJsonResponse(providerResponse);
        try {
          await write(`${JSON.stringify(output, null, 2)}\n`);
        } catch (cause) {
          throw new Error(`Unable to write prompt output: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
        }
        return { ...output, ...(usage ? { usage: providerResponse.usage ?? null } : {}) };
      }
      const toolCategories = (tool) => {
        const categories = Object.keys(
          tool?.parameters?.properties?.issues?.properties ??
            tool?.parameters?.properties?.suggestions?.properties ??
            {},
        );
        return categories.length ? categories : undefined;
      };
      const categories = toolCategories(request.tools?.[0]);
      const result = combined
        ? parseCombinedToolResponse(
            providerResponse,
            toolCategories(request.tools?.find((tool) => tool.name === 'submit_review')),
            toolCategories(request.tools?.find((tool) => tool.name === 'submit_suggestions')),
          )
        : toolName === 'submit_suggestions'
          ? parseReviewToolResponse(providerResponse, 'submit_suggestions', categories)
          : parseReviewToolResponse(providerResponse, 'submit_review', categories);
      if (result.verdict === 'pass' && testEvidenceBlocks(testResults)) {
        result.verdict = 'block';
      }
      const output = usage
        ? {
            ...result,
            usage: providerResponse.usage
              ? {
                  ...providerResponse.usage,
                  estimated_cost_usd: calculateUsageCost(
                    request.model ?? 'gpt-5.6-luna',
                    providerResponse.usage,
                  ),
                }
              : null,
          }
        : result;

      try {
        await write(`${JSON.stringify(output, null, 2)}\n`);
      } catch (cause) {
        throw new Error(
          `Unable to write review output: ${cause instanceof Error ? cause.message : String(cause)}`,
          { cause },
        );
      }
      return output;
    } catch (cause) {
      if (providerResponseReceived) {
        const fallback = {
          issues: 'not submitted',
          suggestions: 'not submitted',
          error: cause instanceof Error ? cause.message : String(cause),
        };
        try {
          await write(`${JSON.stringify(fallback, null, 2)}\n`);
        } catch {
          // Preserve the original validation/provider failure when fallback output cannot be written.
        }
      }
      const failure = new Error(
        `OpenAI request failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
      if (cause?.code) failure.code = cause.code;
      throw failure;
    }
  } finally {
    controller.abort();
    removeSignalHandlers(signals);
  }
}
