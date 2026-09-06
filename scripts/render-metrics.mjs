import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { themes, svg, text, mono, line, rect } from './design.mjs';

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

export function renderMetrics(snapshot, dark = false, mobile = false) {
  const data = summarize(snapshot.repositories, snapshot.username);
  const p = themes[dark ? 'dark' : 'light'];
  const colors = [p.accent, p.blue, p.purple, p.orange, dark ? '#db94a4' : '#9b4d64', dark ? '#8ba992' : '#496952'];
  const top = data.languages.slice(0, 5);
  const rest = data.languages.slice(5).reduce((s, [, n]) => s + n, 0);
  if (rest) top.push(['Other', rest]);
  const total = data.languages.reduce((s, [, n]) => s + n, 0);
  const date = new Date(snapshot.updatedAt);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid snapshot timestamp');
  const stamp = date.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const cards = [['PUBLIC REPOS', data.repositories], ['NON-FORK REPOS', data.originals], ['STARS RECEIVED', data.stars], ['FORKS RECEIVED', data.forks]];
  if (mobile) {
    let body = mono(24,32,'PUBLIC / GITHUB',13,p.accent)+mono(24,57,stamp,12,p.muted);
    body += cards.map(([label,n],i)=>{
      const x=24+i%2*247;const y=128+Math.floor(i/2)*116;
      return text(x,y,String(n).padStart(2,'0'),52,i===0?p.accent:p.text,'font-weight="700" letter-spacing="-2"')+mono(x,y+30,label,12,p.muted);
    }).join('');
    body+=line(24,296,486,296,p.line)+text(24,330,'Language mix',23,p.text,'font-weight="700"')+text(24,357,'Primary language · non-fork repos',15,p.muted);
    let offset=24;
    for(let i=0;i<top.length;i++){
      const [name,n]=top[i];const width=462*n/total;
      body+=rect(offset,377,Math.max(width-3,0),13,3,colors[i]);offset+=width;
      const x=24+i%2*240;const y=424+Math.floor(i/2)*40;
      body+=`<circle cx="${x+4}" cy="${y-5}" r="4" fill="${colors[i]}"/>`+text(x+15,y,name,15,p.text)+mono(x+220,y,`${Math.round(n/total*100)}%`,13,p.muted,'text-anchor="end"');
    }
    if(!top.length)body+=text(24,420,'No primary language data available yet.',16,p.muted);
    body+=line(24,530,486,530,p.line)+text(24,562,'Refreshed daily with GitHub Actions',14,p.muted);
    return svg(510,586,`${snapshot.username} — public GitHub metrics`,p,body);
  }
  let body = mono(31,34,'THE PUBLIC SIDE OF MY WORK.',10,p.muted,'letter-spacing="1.1"') +
    mono(1008,34,stamp,10,p.muted,'text-anchor="end"');
  body += cards.map(([label,n],i) => {
    const x = 32+i*252;
    return text(x,104,String(n).padStart(2,'0'),51,i===0?p.accent:p.text,'font-weight="700" letter-spacing="-2"')+
      mono(x,131,label,10,p.muted,'letter-spacing="1"')+(i<3?line(x+226,66,x+226,135,p.line):'');
  }).join('');
  body += line(32,158,1008,158,p.line)+text(32,193,'Language mix',16,p.text,'font-weight="700"')+
    text(1008,193,'Primary language · non-fork repositories',11,p.muted,'text-anchor="end"');
  let offset=32;
  const segmentWidth=976;
  const bar = top.map(([name,n],i)=>{
    const width=segmentWidth*n/total;
    const result=rect(offset,213,Math.max(width-4,0),12,3,colors[i]);offset+=width;return result;
  }).join('');
  const legend=top.map(([name,n],i)=>{
    const x=32+i%3*334;const y=254+Math.floor(i/3)*29;
    return `<circle cx="${x+4}" cy="${y-4}" r="4" fill="${colors[i]}"/>`+
      text(x+17,y,name,12,p.text)+mono(x+290,y,`${n} · ${Math.round(n/total*100)}%`,11,p.muted,'text-anchor="end"');
  }).join('');
  body+=top.length?bar+legend:text(32,236,'No primary language data available yet.',13,p.muted);
  body+=line(32,307,1008,307,p.line)+mono(32,335,'GITHUB API → JAVASCRIPT → SVG',9,p.muted,'letter-spacing=".7"')+
    text(1008,335,'Refreshed daily with GitHub Actions',10,p.muted,'text-anchor="end"');
  return svg(1040,355,`${snapshot.username} — public GitHub metrics`,p,body,{description:`${data.repositories} public repositories, ${data.originals} non-fork repositories, ${data.stars} stars and ${data.forks} forks received on non-fork repositories. Updated ${stamp}.`});
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
  const mobileLight = renderMetrics(snapshot, false, true);
  const mobileDark = renderMetrics(snapshot, true, true);
  const output = options['--output'] || 'assets';
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'metrics-light.svg'), light);
  await writeFile(resolve(output, 'metrics-dark.svg'), dark);
  await writeFile(resolve(output, 'metrics-mobile-light.svg'), mobileLight);
  await writeFile(resolve(output, 'metrics-mobile-dark.svg'), mobileDark);
  await writeFile(resolve(output, 'metrics.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`Rendered metrics for ${snapshot.username}: ${snapshot.repositories.length} public repositories`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
