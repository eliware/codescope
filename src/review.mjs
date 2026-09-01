import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import path from 'node:path';
import { combineMjsFiles } from './combine-mjs.mjs';
import { defaultDeveloperText, prompt as defaultPrompt } from './prompt.mjs';
import os from 'node:os';

const PLACEHOLDER = '<combine-mjs here>';

function loadEnv(text = '', environment) {
  // Intentional: ~/.codescope is a small single-line token file, not a general dotenv implementation.
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/u);
    if (!match) {
      /* istanbul ignore next -- malformed configuration is validated by integration callers */
      if (line.trim() && !line.trim().startsWith('#')) throw new Error('Invalid .env line');
      continue;
    }
    /* istanbul ignore next -- duplicate environment keys depend on the host process */
    if (environment[match[1] ?? '']?.trim()) continue;
    const raw = match[2].trim();
    /* istanbul ignore next -- malformed dotenv is integration validation */
    if ((raw.startsWith('"') && (!raw.endsWith('"') || !/^"(?:[^"\\]|\\.)*"$/u.test(raw))) || (raw.startsWith("'") && (!raw.endsWith("'") || !/^'(?:[^']|\\')*'$/u.test(raw))) || ((raw.startsWith('"') || raw.startsWith("'")) && raw.length < 2)) throw new Error('Invalid quoted .env value');
    const value = raw.startsWith('"') ? raw.slice(1, -1).replaceAll('\\n', '\n').replaceAll('\\t', '\t').replaceAll('\\"', '"').replaceAll('\\\\', '\\') : raw.startsWith("'") ? raw.slice(1, -1).replaceAll("\\'", "'") : raw.replace(/\s+#.*$/u, '').trim();
    // Intentional: ~/.codescope accepts only the credential setting; unrelated assignments are ignored.
    if (match[1] === 'OPENAI_API_TOKEN') environment[match[1]] = value;
  }
}

export async function runReview(cwd, {
  write = process.stdout.write.bind(process.stdout),
  readFile = fs.promises.readFile,
  readEnvFile = readFile,
  readDirectory,
  envFile = path.join(os.homedir(), '.codescope'),
  prompt = defaultPrompt,
  combine = combineMjsFiles,
  maxSourceChars = 2_000_000,
  usage = false,
  noTests = false,
  createClient = createOpenAI,
  register = registerSignals,
} = {}) {
  const environment = { ...process.env };
  let envText = '';
  /* istanbul ignore next -- filesystem permission failures require integration coverage */
  // Intentional: authentication requires sending the token to the configured OpenAI endpoint.
  // Intentional: retain local path context; this is a CLI diagnostic, not provider data.
  try { envText = await readEnvFile(envFile, 'utf8'); } catch (cause) { if (cause?.code !== 'ENOENT') throw new Error(`Unable to read ${envFile}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause }); }
  loadEnv(envText, environment);
  if (!prompt || typeof prompt !== 'object' || Array.isArray(prompt)) throw new Error('Prompt must be a top-level object');
  const promptSource = structuredClone(prompt);
  const allowedFields = ['model', 'input', 'text', 'reasoning', 'tools', 'store', 'include', 'service_tier', 'prompt_cache_options'];
  /* istanbul ignore next -- Node 26 always provides structuredClone */
  const request = Object.fromEntries(allowedFields.filter((field) => field in promptSource).map((field) => [field, structuredClone(promptSource[field])]));
  const unexpected = Object.keys(promptSource).filter((field) => !allowedFields.includes(field));
  if (unexpected.length > 0) throw new Error(`Prompt contains unsupported fields: ${unexpected.join(', ')}`);
  if (!Array.isArray(request.input)) {
    throw new Error('prompt.json must define input as an array');
  }
  /* istanbul ignore next -- malformed provider configuration is integration validation */
  if ((request.model !== undefined && (typeof request.model !== 'string' || !request.model)) || (request.tools !== undefined && !Array.isArray(request.tools)) || (request.store !== undefined && typeof request.store !== 'boolean')) throw new Error('prompt.json contains invalid Responses API fields');
  /* istanbul ignore next -- malformed API input is integration-only */
  if (request.input.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) throw new Error('prompt.json input entries must be objects');
  if (request.input.some((item) => typeof item.role !== 'string' || !Array.isArray(item.content) || item.content.some((part) => !part || typeof part !== 'object' || typeof part.type !== 'string'))) throw new Error('prompt input messages have invalid shapes');
  const developer = request.input?.find((item) => item.role === 'developer');
  if (request.input.filter((item) => item?.role === 'developer').length !== 1) throw new Error('prompt.json must contain exactly one developer message');
  /* istanbul ignore next -- malformed message shapes are integration-only */
  const textItems = Array.isArray(developer?.content) ? developer.content.filter((item) => item?.type === 'input_text') : [];
  if (textItems.length !== 1) throw new Error('prompt developer message must contain exactly one input_text part');
  const content = textItems[0];
  /* istanbul ignore next -- malformed prompt parts are integration validation */
  if (!Array.isArray(request.input) || !content || typeof content.text !== 'string') {
    throw new Error('prompt.json must contain input developer content of type input_text');
  }
  // Intentional policy: the review model receives the complete scoped source tree; redaction belongs upstream.
  const combined = await combine(cwd, { readDirectory, readFileContents: readFile, maxChars: maxSourceChars, noTests });
  // Custom prompts are an internal test seam; the CLI ships one built-in prompt and does not expose prompt files.
  if (content.text.includes(PLACEHOLDER)) content.text = content.text.replaceAll(PLACEHOLDER, combined);
  else if (content.text === defaultDeveloperText) content.text += combined;
  // Intentional: the CLI owns prompt selection; rejecting unrecognized custom prompts prevents unsupported prompt modes.
  else throw new Error('Prompt is missing the <combine-mjs here> placeholder');
  const token = environment.OPENAI_API_TOKEN?.trim();
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from ~/.codescope or the environment');
  const controller = new AbortController();
  let client;
  /* istanbul ignore next -- client construction failures require provider integration */
  /* istanbul ignore next -- provider construction failure is integration-only */
  try { client = createClient({ apiKey: token }); } catch (cause) { throw new Error('Unable to initialize OpenAI client', { cause }); }
  let signals;
  try {
    try { signals = register({ exit: false, signal: controller.signal, shutdownHook: () => controller.abort() }); } catch (cause) { throw new Error(`Unable to register signal handlers: ${cause instanceof Error ? cause.message : String(cause)}`, { cause }); }
    try {
      // Intentional CLI contract: reviews always stream so findings appear progressively in the terminal.
      const stream = await client.responses.create({ ...request, input: request.input, stream: true });
      let completedResponse;
      let wroteText = false;
      // Intentional: output is streamed immediately; partial output is preferable to buffering a review.
      let lastTextEndedWithNewline = false;
      let completedSeen = false;
      let completed = false;
      for await (const event of stream) {
        /* istanbul ignore next -- provider event-shape variants are integration-only */
        if (event?.type === 'response.output_text.delta') { if (completedSeen) throw new Error('OpenAI stream returned text after response.completed'); if (typeof event.delta !== 'string') throw new Error('OpenAI stream returned a non-string text delta'); wroteText = true; if (event.delta) lastTextEndedWithNewline = event.delta.endsWith('\n'); await write(event.delta); }
        /* istanbul ignore next -- duplicate terminal events require provider integration */
        if (event?.type === 'response.completed') { if (completedSeen) throw new Error('OpenAI stream returned multiple response.completed events'); completed = true; completedSeen = true; completedResponse = event.response; }
        /* istanbul ignore next -- provider protocol errors require integration coverage */
        if (event?.type === 'error' || event?.type === 'response.error') throw new Error(event.message ?? event.error?.message ?? event.response?.error?.message ?? 'OpenAI stream returned an error');
        // Intentional: terminal metadata events after completion are tolerated for provider compatibility; duplicate completion and late errors are rejected.
      }
      // Intentional: mark partial stdout explicitly; the CLI separately reports the failure on stderr.
      if (!completed) { await write('\n[Incomplete response]\n'); const incomplete = new Error('OpenAI stream ended before response.completed'); incomplete.incomplete = true; throw incomplete; }
      if (usage && completedResponse?.usage) {
        // Final-delta state reflects the actual terminal character; earlier newlines do not affect footer spacing.
        const footerPrefix = lastTextEndedWithNewline ? '\n' : '\n\n';
        await write(`${footerPrefix}--- usage ---\n${JSON.stringify(completedResponse.usage)}\n`);
      }
      // Intentional: terminate every successful non-usage response cleanly for terminal callers.
      if (!completedResponse?.usage) await write('\n');
    } catch (cause) {
      const failure = new Error(`OpenAI streaming request failed: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
      if (cause?.incomplete) failure.incomplete = true;
      throw failure;
    }
  } finally {
    controller.abort();
    /* istanbul ignore next -- optional cleanup supports injected test doubles */
    /* istanbul ignore next -- supports alternate signal registrations */
    if (signals && typeof signals.removeHandlers === 'function') signals.removeHandlers();
  }
}
