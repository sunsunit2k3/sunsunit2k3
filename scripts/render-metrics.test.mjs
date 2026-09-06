import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { summarize, fetchRepositories, renderMetrics, main } from './render-metrics.mjs';

const repo = (id, extra = {}) => ({ id, name: `repo-${id}`, owner: { login: 'long' }, private: false, fork: false, stargazers_count: 2, forks_count: 1, language: 'Dart', ...extra });
const snapshot = (repositories) => ({ username: 'long', updatedAt: '2026-09-06T12:00:00Z', repositories });

test('totals exclude private and foreign repos, deduplicate IDs, and isolate forks', () => {
  assert.deepEqual(summarize([repo(1), repo(1), repo(2, { fork: true, stargazers_count: 100 }), repo(3, { private: true }), repo(4, { owner: { login: 'someone-else' } }), repo(5, { language: null })], 'LONG'), {
    repositories: 3, originals: 2, stars: 4, forks: 2, languages: [['Dart', 1]],
  });
});

test('pagination fetches beyond the first 100 repositories', async () => {
  const pages = [];
  const result = await fetchRepositories('long', { token: '', fetchImpl: async (url) => {
    const page = Number(new URL(url).searchParams.get('page'));
    pages.push(page);
    return { ok: true, json: async () => page === 1 ? Array.from({ length: 100 }, (_, i) => repo(i)) : [repo(100)] };
  } });
  assert.equal(result.length, 101);
  assert.deepEqual(pages, [1, 2]);
});

test('rate limit errors reject instead of returning empty metrics', async () => {
  await assert.rejects(fetchRepositories('long', { fetchImpl: async () => ({ ok: false, status: 403 }) }), /HTTP 403/);
});

test('temporary server failures retry with a bounded attempt count', async () => {
  let attempts = 0;
  const result = await fetchRepositories('long', { sleep: async () => {}, fetchImpl: async () => ++attempts < 3 ? { ok: false, status: 503 } : { ok: true, json: async () => [] } });
  assert.equal(attempts, 3);
  assert.deepEqual(result, []);
});

test('SVG escapes metadata and renders empty language data without NaN', () => {
  const svg = renderMetrics(snapshot([repo(1, { language: '<script>&"' })]));
  assert.ok(svg.includes('&lt;script&gt;&amp;&quot;'));
  assert.ok(!svg.includes('<script>'));
  const empty = renderMetrics(snapshot([]), true);
  assert.ok(empty.includes('No primary language data'));
  assert.ok(!/NaN|Infinity/.test(empty));
});

test('invalid snapshot preserves all previous output files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'profile-test-'));
  try {
    const file = join(dir, 'snapshot.json');
    await writeFile(file, JSON.stringify(snapshot([repo(1, { stargazers_count: -1 })])));
    const outputs = ['metrics-light.svg', 'metrics-dark.svg', 'metrics.json'];
    for (const output of outputs) await writeFile(join(dir, output), 'last good');
    await assert.rejects(main(['--input', file, '--output', dir]), /Invalid public repository metrics/);
    for (const output of outputs) assert.equal(await readFile(join(dir, output), 'utf8'), 'last good');
  } finally { await rm(dir, { recursive: true, force: true }); }
});
