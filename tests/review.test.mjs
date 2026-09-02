import { runReview } from '../src/review.mjs';
import { defaultDeveloperText } from '../src/prompt.mjs';

const validPrompt = (text = '<combine-mjs here>') => ({
  input: [{ role: 'developer', content: [{ type: 'input_text', text }] }],
});
const base = (overrides = {}) => ({
  readEnvFile: async () => 'OPENAI_API_TOKEN=test-token',
  combine: async () => 'source',
  prompt: validPrompt(),
  createClient: () => ({ responses: { create: async () => ({ output: [{ type: 'function_call', name: 'submit_review', arguments: '{"issues":[],"verdict":"pass"}' }] }) } }),
  register: () => ({ removeHandlers() {} }),
  write: () => {},
  ...overrides,
});

test('runs a review with placeholder and usage', async () => {
  let request;
  await runReview('/root', base({ usage: true, createClient: () => ({ responses: { create: async (value) => { request = value; return { usage: { total_tokens: 1 }, output: [{ type: 'function_call', name: 'submit_review', arguments: '{"issues":[],"verdict":"pass"}' }] }; } } }) }));
  expect(request.input[0].content[0].text).toContain('source');
});

test('handles the default config path when no config file exists', async () => {
  const previous = process.env.OPENAI_API_TOKEN;
  process.env.OPENAI_API_TOKEN = 'environment-token';
  try {
    await runReview('/root', {
      prompt: validPrompt(),
      combine: async () => '',
      createClient: () => ({ responses: { create: async () => ({ output: [{ type: 'function_call', name: 'submit_review', arguments: '{"issues":[],"verdict":"pass"}' }] }) } }),
      register: ({ shutdownHook }) => { shutdownHook(); return {}; },
      write: () => {},
    });
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_TOKEN;
    else process.env.OPENAI_API_TOKEN = previous;
  }
});

test('checks default config symlinks and permissions through injectable inspectors', async () => {
  const opts = { prompt: validPrompt(), combine: async () => '', inspectFile: async () => ({ isSymbolicLink: () => true }) };
  await expect(runReview('/root', opts)).rejects.toThrow('symbolic link');
  await expect(runReview('/root', { ...opts, inspectFile: async () => ({ isSymbolicLink: () => false }), inspectPermissions: async () => ({ mode: 0o644 }) })).rejects.toThrow('readable');
  await expect(runReview('/root', { ...opts, inspectFile: async () => { throw new Error('inspect'); } })).rejects.toThrow('inspect');
  await expect(runReview('/root', { ...opts, inspectFile: async () => ({ isSymbolicLink: () => false }), inspectPermissions: async () => { throw new Error('permissions'); } })).rejects.toThrow('permissions');
  await expect(runReview('/root', { ...opts, inspectFile: async () => { throw 'inspect string'; } })).rejects.toThrow('inspect string');
  await expect(runReview('/root', { ...opts, inspectFile: async () => ({ isSymbolicLink: () => false }), inspectPermissions: async () => { throw 'permission string'; } })).rejects.toThrow('permission string');
  await expect(runReview('/root', { ...opts, inspectFile: async () => ({ isSymbolicLink: () => false }), inspectPermissions: async () => ({ mode: 0 }) })).rejects.toThrow('OPENAI_API_TOKEN');
});

test('supports the default prompt source insertion', async () => {
  await runReview('/root', base({ prompt: { input: [{ role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] }, { role: 'user', content: [{ type: 'input_text', text: 'Review this.' }] }] } }));
});

test('rejects prompt and environment validation failures', async () => {
  for (const prompt of [null, [], { input: 'bad' }, { input: [] }, { extra: true, input: [] }])
    await expect(runReview('/root', base({ prompt }))).rejects.toThrow();
  await expect(runReview('/root', base({ readEnvFile: async () => '' }))).rejects.toThrow('OPENAI_API_TOKEN');
  await expect(runReview('/root', base({ readEnvFile: async () => 'bad line' }))).rejects.toThrow('Invalid');
  await expect(runReview('/root', base({ createClient: () => { throw new Error('client'); } }))).rejects.toThrow('initialize');
});

test('wraps request, response, registration, and output errors', async () => {
  await expect(runReview('/root', base({ register: () => { throw new Error('signals'); } }))).rejects.toThrow('register');
  await expect(runReview('/root', base({ createClient: () => ({ responses: { create: async () => { throw new Error('request'); } } }) }))).rejects.toThrow('OpenAI request failed');
  await expect(runReview('/root', base({ createClient: () => ({ responses: { create: async () => ({ output: [] }) } }) }))).rejects.toThrow('exactly one');
  await expect(runReview('/root', base({ write: async () => { throw new Error('write'); } }))).rejects.toThrow('OpenAI request failed');
});

test('covers prompt routing and collaborator failures', async () => {
  await expect(runReview('/root', base({ prompt: { input: [{ role: 'developer', content: [{ type: 'input_text', text: 'custom' }] }] } }))).rejects.toThrow('placeholder');
  await expect(runReview('/root', base({ prompt: { input: [{ role: 'developer', content: [{ type: 'input_text', text: defaultDeveloperText }] }] } }))).rejects.toThrow('user input_text');
  await expect(runReview('/root', base({ combine: async () => { throw new Error('combine'); } }))).rejects.toThrow('combine');
  await expect(runReview('/root', base({ register: () => { throw 'signal failure'; } }))).rejects.toThrow('signal failure');
  await expect(runReview('/root', base({ createClient: () => ({ responses: { create: async () => { throw 'request failure'; } } }) }))).rejects.toThrow('request failure');
  await expect(runReview('/root', base({ write: async () => { throw 'output failure'; } }))).rejects.toThrow('output failure');
});

test('handles environment read failures and missing usage', async () => {
  await expect(runReview('/root', base({ readEnvFile: async () => { throw new Error('env read'); } }))).rejects.toThrow('Unable to read');
  await expect(runReview('/root', base({ readEnvFile: async () => { throw 'env string'; } }))).rejects.toThrow('env string');
  await runReview('/root', base({ usage: true, createClient: () => ({ responses: { create: async () => ({ output: [{ type: 'function_call', name: 'submit_review', arguments: '{"issues":[],"verdict":"pass"}' }] }) } }) }));
});

test('cleans up when the signal registrar has no removal hook', async () => {
  await runReview('/root', base({ register: () => ({}) }));
  await runReview('/root', base({ register: () => null }));
});
