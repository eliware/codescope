import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import { combineMjsFiles } from './combine-mjs.mjs';
import { prompt as defaultPrompt } from './prompt.mjs';
import { defaultEnvFile, loadEnv } from './review-config.mjs';
import { lstat, stat } from 'node:fs/promises';
import { parseCombinedToolResponse, parseReviewToolResponse } from './review-response.mjs';
import { prepareRequest } from './review-request.mjs';
import { removeSignalHandlers } from './review-cleanup.mjs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { calculateUsageCost } from './pricing.mjs';

const runCommand = promisify(exec);
const MAX_TEST_OUTPUT = 500_000;
// codescope ignore: redaction intentionally covers documented credential patterns; target test commands must not print secrets.
export const redactTestOutput = (value) =>
  String(value ?? '')
    .replace(
      /((?:api[_-]?key|token|password|secret)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s]+)/giu,
      '$1[redacted]',
    )
    .replace(
      /((?:["']?(?:api[_-]?key|token|password|secret)["']?\s*:\s*))(?:"[^"]*"|'[^']*'|[^\s,}]+)/giu,
      '$1[redacted]',
    )
    .replace(/((?:[A-Z][A-Z0-9_]{2,})\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s]+)/gu, '$1[redacted]')
    .replace(/\b(?:sk|ghp|github_pat|xoxb)-[A-Za-z0-9_-]+/gu, '[redacted]')
    .replace(/\bBearer\s+[A-Za-z0-9._~-]+/giu, 'Bearer [redacted]')
    .replace(/([?&](?:api[_-]?key|token|password|secret)=)[^&#\s]+/giu, '$1[redacted]')
    .replace(/-----BEGIN [^-]+-----[\s\S]*?-----END [^-]+-----/gu, '[redacted-private-key]')
    .replace(/\bAKIA[0-9A-Z]{16}\b/gu, '[redacted-aws-key]')
    .replace(/\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/gu, '[redacted-jwt]')
    .slice(0, MAX_TEST_OUTPUT);

export async function collectTestResults(
  cwd,
  timeout,
  execute = runCommand,
  redact = redactTestOutput,
) {
  if (!Number.isFinite(timeout) || timeout < 1) throw new Error('Test timeout must be positive');
  // codescope ignore: npm test intentionally runs the target repository's own validation command with the caller's environment.
  try {
    const result = await execute('npm test', {
      cwd,
      timeout,
      maxBuffer: 1_000_000,
      windowsHide: true,
    });
    const output = redact(`${String(result.stdout ?? '')}${String(result.stderr ?? '')}`);
    const code = result.code ?? 0;
    const status = code === 0 ? 'exit code: 0' : `exit code: ${code}`;
    return `===== npm test =====\n${status}\n${output}`;
  } catch (cause) {
    const output = redact(`${String(cause.stdout ?? '')}${String(cause.stderr ?? '')}`);
    const status = cause.killed
      ? `timed out after ${timeout / 1000} seconds`
      : `exit code: ${cause.code ?? 'unknown'}`;
    return `===== npm test =====\n${status}\n${output}`;
  }
}

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
    createClient,
    register,
    inspectFile,
    inspectPermissions,
    platform,
  } = { ...defaults, ...options };
  if (typeof cwd !== 'string' || !cwd) throw new Error('runReview cwd must be a non-empty path string');
  if (!Number.isFinite(maxSourceChars) && maxSourceChars !== Infinity)
    throw new Error('runReview maxSourceChars must be finite or Infinity');
  if (maxSourceChars < 1) throw new Error('runReview maxSourceChars must be positive');
  if (!Number.isFinite(testTimeoutMs) || testTimeoutMs < 1)
    throw new Error('runReview testTimeoutMs must be positive');
  for (const [name, value] of Object.entries({ usage, dryRun, includesTests, omitTestResults }))
    if (value !== undefined && typeof value !== 'boolean')
      throw new Error(`runReview option ${name} must be a boolean`);
  // Programmatic callers own the consistency of injected filesystem collaborators; the CLI uses the secure defaults.
  for (const [name, value] of Object.entries({
    write,
    readFile,
    readEnvFile,
    combine,
    runTestCommand,
    redactOutput,
    createClient,
    register,
  }))
    if (typeof value !== 'function') throw new Error(`runReview option ${name} must be a function`);
  const environment = { ...process.env };
  let envText = '';

  if (readEnvFile === readFile && envFile === defaultEnvFile()) {
    // codescope ignore: ~/.codescope lstat-before-read symlink-swap race is an accepted user-config threat-model boundary.
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

  if (readEnvFile === readFile && envFile === defaultEnvFile() && platform !== 'win32') {
    // codescope ignore: profile-specific runReview dispatch is covered by prompt-construction and injected-client tests; subprocess and every-profile integration duplication is intentionally out of scope.
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
  const token = environment.OPENAI_API_TOKEN?.trim();
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from ~/.codescope or the environment');
  let testResults;
  if (includesTests && !omitTestResults) {
    // codescope ignore: the undefined executor intentionally selects the default npm-test runner; redaction is the separate fourth argument.
    try {
      testResults = await runTestCommand(cwd, testTimeoutMs, undefined, redactOutput);
    } catch (cause) {
      testResults = `===== npm test =====\nexit code: unknown\n${redactOutput(String(cause))}`;
    }
  }
  if (testResults !== undefined && typeof testResults !== 'string')
    throw new Error('Test runner must return a string');
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

export function testEvidenceBlocks(testResults) {
  if (typeof testResults !== 'string') return false;
  const match = testResults.match(/(?:^|\r?\n)===== npm test =====\r?\n([^\r\n]*)/u);
  if (!match) return false;
  const status = match[1].trim();
  return /^(?:exit code:\s*(?:[1-9]\d*|unknown)|timed out after\b)/iu.test(status);
}
