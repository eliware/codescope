import { main, parseArgs, VERSION } from '../src/cli.mjs';
import { findMjsFiles } from '../src/find-mjs.mjs';
import { combineMjsFiles } from '../src/combine-mjs.mjs';
import { runReview } from '../src/review.mjs';

test('parses the default command as help', () => {
  expect(parseArgs([])).toEqual({ command: 'review' });
});

test('rejects unexpected arguments', () => {
  expect(() => parseArgs(['help', 'extra'])).toThrow(/Unexpected arguments/);
});

test('finds nested mjs files while ignoring configured directories', async () => {
  const tree = {
    '/root': [
      { name: '.git', isDirectory: () => true, isFile: () => false },
      { name: 'node_modules', isDirectory: () => true, isFile: () => false },
      { name: 'app.mjs', isDirectory: () => false, isFile: () => true },
      { name: 'lib', isDirectory: () => true, isFile: () => false },
    ],
    '/root/lib': [
      { name: 'nested.mjs', isDirectory: () => false, isFile: () => true },
      { name: 'readme.md', isDirectory: () => false, isFile: () => true },
    ],
  };
  const files = await findMjsFiles('/root', {
    readDirectory: async (directory) => tree[directory.replaceAll('\\', '/').replace(/^.*?(?=\/root)/, '')],
  });
  expect(files).toEqual(['app.mjs', 'lib/nested.mjs']);
});

test('prints help and succeeds', async () => {
  const output = [];
  expect(await main(['--help'], { output: (value) => output.push(value) })).toBe(0);
  expect(output[0]).toMatch(/Usage: codescope/);
});

test('runs review by default', async () => {
  const output = [];
  expect(await main([], { review: async (_cwd, { write }) => write('reviewed') , output: (value) => output.push(value) })).toBe(0);
  expect(output).toEqual(['reviewed']);
});

test('prints version and succeeds', async () => {
  const output = [];
  expect(await main(['--version'], { output: (value) => output.push(value) })).toBe(0);
  expect(output[0]).toBe(VERSION);
});

test('rejects unknown commands', async () => {
  const errors = [];
  expect(await main(['unknown'], { error: (value) => errors.push(value) })).toBe(2);
  expect(errors[0]).toMatch(/Unknown command/);
});

test('prints mjs files for the current directory', async () => {
  const output = [];
  expect(await main(['find-mjs'], { cwd: process.cwd(), output: (value) => output.push(value) })).toBe(0);
  expect(output).toContain('bin/codescope.mjs');
});

test('combines files with relative path headers', async () => {
  const files = {
    '/root/a.mjs': 'const a = 1;\n',
    '/root/nested/b.mjs': 'const b = 2;\n',
  };
  const readDirectory = async (directory) => {
    const normalized = directory.replaceAll('\\', '/');
    if (normalized === '/root') return [
      { name: 'a.mjs', isDirectory: () => false, isFile: () => true },
      { name: 'nested', isDirectory: () => true, isFile: () => false },
    ];
    return [{ name: 'b.mjs', isDirectory: () => false, isFile: () => true }];
  };
  const result = await combineMjsFiles('/root', {
    readDirectory,
    readFileContents: async (file) => files[file.replaceAll('\\', '/')],
  });
  expect(result).toBe('===== a.mjs =====\nconst a = 1;\n\n\n===== nested/b.mjs =====\nconst b = 2;\n');
});

test('prints the combined result through the command', async () => {
  const output = [];
  expect(await main(['combine-mjs'], { cwd: process.cwd(), output: (value) => output.push(value) })).toBe(0);
  expect(output[0]).toMatch(/===== bin\/codescope\.mjs =====/);
});

test('runs a streamed review from the prompt', async () => {
  const files = {
    '/root/.env': 'OPENAI_API_TOKEN=test-token\n',
    '/root/prompt.json': JSON.stringify({ input: [{ role: 'developer', content: [{ type: 'input_text', text: '<combine-mjs here>' }] }] }),
    '/root/code.mjs': 'const value = 1;\n',
  };
  const output = [];
  const readFile = async (file) => {
    const normalized = file.replaceAll('\\', '/');
    return Object.entries(files).find(([key]) => normalized.endsWith(key))?.[1];
  };
  const readDirectory = async (directory) => {
    const normalized = directory.replaceAll('\\', '/');
    return normalized === '/root' ? [{ name: 'code.mjs', isDirectory: () => false, isFile: () => true }] : [];
  };
  await runReview('/root', {
    readFile,
    readDirectory,
    write: (value) => output.push(value),
    createClient: () => ({ responses: { create: async () => (async function* () {
      yield { type: 'response.output_text.delta', delta: 'ok' };
      yield { type: 'response.completed' };
    })() } }),
    register: ({ shutdownHook }) => {
      shutdownHook();
      return { removeHandlers: () => {} };
    },
  });
  expect(output).toEqual(['ok']);
  delete process.env.OPENAI_API_TOKEN;
});

test('rejects prompts without the required placeholder', async () => {
  await expect(runReview('/root', {
    readFile: async (file) => file.endsWith('prompt.json') ? '{"input":[]}' : '',
    readDirectory: async () => [],
  })).rejects.toThrow(/placeholder/);
});

test('rejects a review when the API token is absent', async () => {
  delete process.env.OPENAI_API_TOKEN;
  await expect(runReview('/root', {
    readFile: async (file) => file.endsWith('prompt.json')
      ? '{"input":[{"role":"developer","content":[{"type":"input_text","text":"<combine-mjs here>"}]}]}'
      : Promise.reject(new Error('not found')),
    readDirectory: async () => [],
  })).rejects.toThrow(/OPENAI_API_TOKEN/);
});
