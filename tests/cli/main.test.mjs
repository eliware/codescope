import { main } from '../../src/cli/main.mjs';
import { getProfile } from '../../src/profiles/index.mjs';

const validResult = (profile, mode = 'review') => {
  const { prompt } = getProfile(profile, mode);
  const field = mode === 'suggest' ? 'suggestions' : 'issues';
  const categories = Object.keys(prompt.tools[0].parameters.properties[field].properties);
  const item =
    mode === 'suggest'
      ? {
          location: 'none',
          suggestion: 'No suggestions found.',
          rationale: '',
          ignore_example: '// codescope ignore: no suggestion is present.',
        }
      : {
          severity: 'P3',
          location: 'none',
          issue: 'No issues found.',
          ignore_example: '// codescope ignore: no issue is present.',
        };
  const payload = Object.fromEntries(categories.map((category) => [category, [item]]));
  return mode === 'suggest' ? { suggestions: payload } : { issues: payload, verdict: 'pass' };
};

test('main dispatches help without provider work', async () => {
  const output = [];
  await expect(main(['help'], { output: (value) => output.push(value) })).resolves.toBe(0);
  expect(output.join('')).toContain('## Owner workflow');
});

test('main preserves accepted meta-command additions without applying them', async () => {
  const output = [];
  let reviewed = false;
  await expect(
    main(['help', '--add', 'diagnostic context'], {
      output: (value) => output.push(value),
      review: async () => { reviewed = true; },
    }),
  ).resolves.toBe(0);
  expect(output.join('')).toContain('## Owner workflow');
  expect(reviewed).toBe(false);
});

test('main forwards additions to profile execution', async () => {
  let received;
  await expect(
    main(['all', '--add', 'first', '-a', 'second'], {
      review: async (_cwd, options) => { received = options; },
      write: () => {},
    }),
  ).resolves.toBe(0);
  expect(received.add).toEqual(['first', 'second']);
});

test('main dispatches version and reports unknown commands', async () => {
  const output = [];
  expect(await main(['version'], { output: (value) => output.push(value) })).toBe(0);
  expect(output).toHaveLength(1);
  expect(await main(['unknown'], { error: () => {} })).toBe(2);
  expect(await main(['all', '--add'], { error: () => {} })).toBe(2);
});

test('main handles metadata options without review work', async () => {
  const output = [];
  let called = false;
  const review = async () => {
    called = true;
  };
  await expect(
    main(['all', '--help'], { output: (value) => output.push(value), review }),
  ).resolves.toBe(0);
  await expect(
    main(['--version'], { output: (value) => output.push(value), review }),
  ).resolves.toBe(0);
  expect(called).toBe(false);
});

test('main returns mapped status for dry runs and provider failures', async () => {
  await expect(
    main(['all', '--dry-run'], { review: async () => ({}), output: () => {} }),
  ).resolves.toBe(0);
  await expect(
    main(['all'], {
      review: async () => {
        throw Object.assign(new Error('API request failed'), { code: 'API' });
      },
      error: () => {},
    }),
  ).resolves.toBe(5);
});

test('main handles prompt, suggestion, combined, and invalid response paths', async () => {
  const write = () => {};
  await expect(
    main(['prompt', 'return', 'json', '--effort=low'], {
      review: async () => ({ verdict: 'pass' }),
      write,
    }),
  ).resolves.toBe(0);
  await expect(
    main(['prompt', 'return', 'json'], { review: async () => ({}), write }),
  ).resolves.toBe(0);
  await expect(
    main(['new-features'], { review: async () => validResult('new-features', 'suggest'), write }),
  ).resolves.toBe(0);
  await expect(
    main(['security'], { review: async () => validResult('security'), write }),
  ).resolves.toBe(0);
  await expect(
    main(['all'], {
      review: async () => ({
        findings: Object.fromEntries(
          Object.keys(
            getProfile('all').prompt.tools[0].parameters.properties.findings.properties,
          ).map((category) => [
            category,
            [
              {
                severity: 'P3',
                location: 'none',
                finding: 'No issues found.',
                recommendation: 'No suggestions found.',
                rationale: '',
                ignore_example: '// codescope ignore: no issue or suggestion is present.',
              },
            ],
          ]),
        ),
        verdict: 'pass',
      }),
      write,
    }),
  ).resolves.toBe(0);
  await expect(
    main(['all', '--usage'], { review: async () => ({}), error: () => {}, write }),
  ).resolves.toBe(0);
  await expect(
    main(['security', '--effort=low'], {
      review: async () => validResult('security'),
      write,
    }),
  ).resolves.toBe(0);
  await expect(
    main(['all'], {
      review: async () => {
        throw 'provider failure';
      },
      error: () => {},
      write,
    }),
  ).resolves.toBe(4);
});

test('main uses default collaborators for help', async () => {
  await expect(main(['--help'])).resolves.toBe(0);
});

test('main adapts the default stream writer to the review writer contract', async () => {
  const originalWrite = process.stdout.write;
  const writes = [];
  process.stdout.write = (value) => {
    writes.push(value);
    return true;
  };
  try {
    await expect(
      main(['all'], {
        review: async (_cwd, options) => options.write('provider response'),
      }),
    ).resolves.toBe(0);
  } finally {
    process.stdout.write = originalWrite;
  }
  expect(writes).toEqual(['provider response']);
});
