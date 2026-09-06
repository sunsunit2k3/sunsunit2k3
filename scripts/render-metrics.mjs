import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const escapeXml = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
}[c]));

export function summarize(repositories, username) {
  const unique = new Map();
  for (const repo of repositories) {
    if (repo.private !== false || repo.owner?.login?.toLowerCase() !== username.toLowerCase()) continue;
    if (!Number.isInteger(repo.id) || !Number.isInteger(repo.stargazers_count) || repo.stargazers_count < 0 ||
        !Number.isInteger(repo.forks_count) || repo.forks_count < 0 || typeof repo.fork !== 'boolean') {
      throw new Error('Invalid public repository metrics');
    }
    unique.set(repo.id, repo);
  }
  const visible = [...unique.values()];
  const originals = visible.filter((repo) => !repo.fork);
  const languages = new Map();
  for (const repo of originals) {
    if (repo.language) languages.set(repo.language, (languages.get(repo.language) ?? 0) + 1);
  }
  return {
    repositories: visible.length,
    originals: originals.length,
    stars: originals.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    forks: originals.reduce((sum, repo) => sum + repo.forks_count, 0),
    languages: [...languages].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}

export async function fetchRepositories(username, { fetchImpl = fetch, token = process.env.GITHUB_TOKEN, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw new Error('Invalid GitHub username');
  const all = [];
  for (let page = 1; page <= 1000; page++) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=full_name&per_page=100&page=${page}`;
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetchImpl(url, {
        headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'github-profile-metrics', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        signal: AbortSignal.timeout(20000),
      });
      if (response.ok || response.status < 500) break;
      if (attempt < 2) await sleep(1000 * 2 ** attempt);
    }
    if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}; existing assets were kept. Check token permissions or API rate limits.`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('Unexpected GitHub API response');
    all.push(...batch);
    if (batch.length < 100) return all;
  }
  throw new Error('Repository pagination limit reached; refusing to publish incomplete totals');
}

export function renderMetrics(snapshot, dark = false) {
  const data = summarize(snapshot.repositories, snapshot.username);
  const p = dark ? { bg: '#0d1623', line: '#253448', text: '#edf5fc', muted: '#a4b6c8', track: '#223146' }
    : { bg: '#f4f8fb', line: '#d5e2e9', text: '#142b3d', muted: '#4d6577', track: '#deeaef' };
  const colors = ['#24b99a', '#489de5', '#af86e8', '#d99939', '#e27188', '#638ead'];
  const top = data.languages.slice(0, 5);
  const rest = data.languages.slice(5).reduce((s, [, n]) => s + n, 0);
  if (rest) top.push(['Other', rest]);
  const total = data.languages.reduce((s, [, n]) => s + n, 0);
  const cards = [['PUBLIC REPOS', data.repositories], ['NON-FORK REPOS', data.originals], ['STARS RECEIVED', data.stars], ['FORKS RECEIVED', data.forks]];
  const date = new Date(snapshot.updatedAt);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid snapshot timestamp');
  const stamp = date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="500" viewBox="0 0 960 500" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(snapshot.username)} — public GitHub metrics</title>
  <desc id="desc">${data.repositories} public repositories, ${data.originals} non-fork repositories, ${data.stars} stars and ${data.forks} forks received on non-fork repositories. Updated ${stamp}.</desc>
  <rect x="1" y="1" width="958" height="498" rx="24" fill="${p.bg}" stroke="${p.line}"/>
  <g font-family="DejaVu Sans,Arial,sans-serif" fill="${p.text}">
  <text x="36" y="47" font-size="15" font-weight="700" letter-spacing="2">PUBLIC / GITHUB</text>
  <text x="924" y="47" text-anchor="end" font-size="12" fill="${p.muted}">${stamp}</text>
  ${cards.map(([label, count], i) => `<g transform="translate(${36 + i * 226},79)"><text y="52" font-size="48" font-weight="700">${count}</text><text y="81" font-size="12" fill="${p.muted}" letter-spacing="1">${label}</text></g>`).join('')}
  <path d="M36 191H924" stroke="${p.line}"/>
  <text x="36" y="224" font-size="16" font-weight="700">Language mix</text>
  <text x="924" y="224" text-anchor="end" font-size="12" fill="${p.muted}">Primary language · non-fork repositories</text>
  ${top.length ? top.map(([name, n], i) => { const x = 36 + (i % 2) * 460; const y = 264 + Math.floor(i / 2) * 66; return `<g transform="translate(${x},${y})"><circle cx="5" cy="-5" r="4" fill="${colors[i]}"/><text x="18" font-size="14">${escapeXml(name)}</text><text x="418" text-anchor="end" font-size="13" fill="${p.muted}">${n} repos · ${Math.round(n / total * 100)}%</text><rect y="13" width="418" height="7" rx="3.5" fill="${p.track}"/><rect y="13" width="${(418 * n / total).toFixed(2)}" height="7" rx="3.5" fill="${colors[i]}"/></g>`; }).join('') : `<text x="36" y="275" font-size="14" fill="${p.muted}">No primary language data available yet.</text>`}
  <text x="36" y="470" font-size="12" fill="${p.muted}">Built from the GitHub API · refreshed daily with GitHub Actions</text>
  </g></svg>\n`;
}

export async function main(args = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--input', '--output', '--username'].includes(args[i]) || !args[i + 1]) throw new Error('Usage: node scripts/render-metrics.mjs [--username LOGIN] [--input snapshot.json] [--output DIRECTORY]');
    options[args[i]] = args[i + 1];
  }
  let snapshot;
  if (options['--input']) {
    snapshot = JSON.parse(await readFile(options['--input'], 'utf8'));
  } else {
    const username = options['--username'] || process.env.PROFILE_USERNAME || 'sunsunit2k3';
    const repositories = await fetchRepositories(username);
    snapshot = { username, updatedAt: new Date().toISOString(), repositories };
  }
  summarize(snapshot.repositories, snapshot.username);
  snapshot.repositories = snapshot.repositories.filter((r) => r.private === false && r.owner?.login?.toLowerCase() === snapshot.username.toLowerCase()).map((r) => ({
    id: r.id, name: r.name, owner: { login: r.owner.login }, private: false, fork: r.fork,
    language: r.language, stargazers_count: r.stargazers_count, forks_count: r.forks_count,
  }));
  // Render before writing: API/validation errors preserve the last good assets.
  const light = renderMetrics(snapshot);
  const dark = renderMetrics(snapshot, true);
  const output = options['--output'] || 'assets';
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'metrics-light.svg'), light);
  await writeFile(resolve(output, 'metrics-dark.svg'), dark);
  await writeFile(resolve(output, 'metrics.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`Rendered metrics for ${snapshot.username}: ${snapshot.repositories.length} public repositories`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
