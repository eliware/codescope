import { fs, registerSignals } from '@eliware/common';
import { createOpenAI } from '@eliware/openai';
import path from 'node:path';
import { combineMjsFiles } from './combine-mjs.mjs';

const PLACEHOLDER = '<combine-mjs here>';

function loadEnv(text) {
  for (const line of text.split(/\r?\n/u)) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/u);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/gu, '');
  }
}

export async function runReview(cwd, {
  write = process.stdout.write.bind(process.stdout),
  readFile = fs.promises.readFile,
  readDirectory,
  createClient = createOpenAI,
  register = registerSignals,
} = {}) {
  loadEnv(await readFile(path.join(cwd, '.env'), 'utf8').catch(() => ''));
  const prompt = JSON.parse(await readFile(path.join(cwd, 'prompt.json'), 'utf8'));
  const developer = prompt.input?.find((item) => item.role === 'developer');
  const content = developer?.content?.find((item) => item.type === 'input_text');
  if (!content?.text?.includes(PLACEHOLDER)) throw new Error('prompt.json is missing the <combine-mjs here> placeholder');
  content.text = content.text.replace(PLACEHOLDER, await combineMjsFiles(cwd, { readDirectory, readFileContents: readFile }));
  const token = process.env.OPENAI_API_TOKEN;
  if (!token) throw new Error('OPENAI_API_TOKEN is missing from .env or the environment');
  const controller = new AbortController();
  const signals = register({ exit: false, signal: controller.signal, shutdownHook: () => controller.abort() });
  try {
    const client = createClient({ apiKey: token });
    const stream = await client.responses.create({ ...prompt, input: prompt.input, stream: true });
    for await (const event of stream) if (event.type === 'response.output_text.delta') write(event.delta);
  } finally {
    signals.removeHandlers();
  }
}
