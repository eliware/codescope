// codescope ignore: this is an intentionally manual, live-provider benchmarking utility; its subprocess timing and persistence are validated by running the benchmark itself rather than by the product test suite.
import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { API_PRICING, calculateUsageCost } from '../src/pricing.mjs';
import { benchmarkExitCode } from '../src/benchmark-status.mjs';

const efforts = ['none', 'low', 'medium', 'high'];
const model =
  process.argv.find((value) => value.startsWith('--model='))?.slice('--model='.length) ??
  'gpt-5.6-luna';
if (!Object.hasOwn(API_PRICING, model))
  throw new Error(`Model must be one of: ${Object.keys(API_PRICING).join(', ')}`);
const pricing = API_PRICING[model];
const cwd = process.cwd();
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const executable = resolve(scriptDirectory, '..', 'bin', 'codescope.mjs');
const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
const logDirectory = resolve(cwd, 'benchmark-results', `effort-${stamp}`);
const summaryPath = resolve(logDirectory, 'summary.json');
let summaryWrite = Promise.resolve();

const parseResult = (output) => {
  try {
    return JSON.parse(output.trim());
  } catch {
    return undefined;
  }
};

const countFindings = (groups, field, emptyValue) =>
  Object.values(groups ?? {})
    .flat()
    .filter((item) => item?.[field] !== emptyValue).length;

const reportResult = (effort, result, npmTest) => {
  const report = parseResult(result.output);
  const usage = report?.usage;
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  const cost =
    inputTokens === null || outputTokens === null
      ? null
      : calculateUsageCost(model, usage);
  return {
    effort,
    issues: report ? countFindings(report.issues, 'issue', 'No issues found.') : null,
    suggestions: report
      ? countFindings(report.suggestions, 'suggestion', 'No suggestions found.')
      : null,
    elapsedMs: Math.round(result.elapsedMs),
    elapsedMinusNpmTestMs: Math.max(0, Math.round(result.elapsedMs - npmTest.elapsedMs)),
    inputTokens,
    outputTokens,
    totalTokens: usage?.total_tokens ?? null,
    cachedTokens: usage?.input_tokens_details?.cached_tokens ?? null,
    cacheWriteTokens: usage?.input_tokens_details?.cache_write_tokens ?? null,
    estimatedCostUsd: cost === null ? null : Number(cost.toFixed(6)),
    verdict: report?.verdict ?? null,
    exitCode: result.code,
    signal: result.signal ?? null,
  };
};

const writeSummary = async (npmTest, results) => {
  const summary = {
    cwd,
    npmTest: { exitCode: npmTest.code, elapsedMs: Math.round(npmTest.elapsedMs) },
    model,
    pricing,
    efforts: Object.fromEntries(
      efforts.map((effort) => {
        const result = results.find((item) => item.effort === effort);
        return [effort, result ? reportResult(effort, result, npmTest) : { status: 'running' }];
      }),
    ),
    logs: logDirectory,
    status: results.length === efforts.length && results.every((result) => result.code === 0)
      ? 'complete'
      : 'incomplete',
  };
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
};

// codescope ignore: benchmark summary persistence is best-effort manual tooling; failed summary writes are intentionally not recovered.
const updateSummary = (npmTest, results) => {
  summaryWrite = summaryWrite.then(() => writeSummary(npmTest, results));
  return summaryWrite;
};

function run(command, args) {
  const started = performance.now();
  return new Promise((resolveResult) => {
    let child;
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolveResult(result);
    };
    try {
      child = spawn(command, args, { cwd, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (error) {
      finish({ code: 1, output: String(error), elapsedMs: performance.now() - started });
      return;
    }
    const chunks = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => chunks.push(chunk));
    child.on('error', (error) =>
      finish({ code: 1, output: String(error), elapsedMs: performance.now() - started }),
    );
    child.on('close', (code, signal) =>
      finish({
        code: code ?? 1,
        signal,
        output: Buffer.concat(chunks).toString('utf8'),
        elapsedMs: performance.now() - started,
      }),
    );
  });
}

await mkdir(logDirectory, { recursive: true });
console.log(`Running npm test in ${cwd}`);
const testCommand = process.platform === 'win32' ? process.env.ComSpec : 'npm';
const testArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm test'] : ['test'];
const testResult = await run(testCommand, testArgs);
await writeFile(resolve(logDirectory, 'npm-test.log'), testResult.output, 'utf8');
const completedResults = [];
await updateSummary(testResult, completedResults);
console.log(`npm test: ${testResult.elapsedMs.toFixed(0)} ms (exit ${testResult.code})`);

if (testResult.code !== 0) {
  console.error('npm test failed; skipping provider benchmark runs');
  process.exitCode = testResult.code ?? 1;
} else {
  console.log(`Running codescope all for ${efforts.join(', ')} in parallel`);
  const started = performance.now();
  const results = await Promise.all(
    efforts.map(async (effort) => {
      const result = await run(process.execPath, [
        executable,
        'all',
        `--model=${model}`,
        `--effort=${effort}`,
        '--usage',
      ]);
      await writeFile(resolve(logDirectory, `codescope-all-${effort}.log`), result.output, 'utf8');
      completedResults.push({ effort, ...result });
      await updateSummary(testResult, completedResults);
      return { effort, ...result };
    }),
  );

  if (benchmarkExitCode(results, efforts.length) !== 0) {
    console.error('One or more provider benchmark runs failed; benchmark is incomplete');
    process.exitCode = 1;
  }
  await summaryWrite;

  console.log(`\nLogs: ${logDirectory}`);
  console.log(`Parallel batch elapsed: ${(performance.now() - started).toFixed(0)} ms`);
  for (const result of results)
    console.log(`${result.effort}: ${result.elapsedMs.toFixed(0)} ms (exit ${result.code})`);
}
