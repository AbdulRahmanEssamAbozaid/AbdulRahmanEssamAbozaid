import {mkdir, writeFile} from 'node:fs/promises';

const username = 'AbdulRahmanEssamAbozaid';
const headers = {'User-Agent': 'github-profile-refresh', Accept: 'application/vnd.github+json'};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function request(path) {
  const response = await fetch(`https://api.github.com${path}`, {headers, signal: AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`GitHub public profile request failed (${response.status}). Existing assets were preserved.`);
  return response.json();
}

const user = await request(`/users/${username}`);
const repositories = [];
for (let page = 1; ; page++) {
  const rows = await request(`/users/${username}/repos?type=owner&per_page=100&page=${page}`);
  repositories.push(...rows.filter(row => !row.private && row.owner.login === username));
  if (rows.length < 100) break;
}
const originals = repositories.filter(repo => !repo.fork);
const snapshot = {
  username,
  updatedAt: new Date().toISOString().slice(0, 10),
  publicOriginalRepositories: originals.length,
  publicForks: repositories.length - originals.length,
  publicOriginalRepositoryStars: originals.reduce((total, repo) => total + repo.stargazers_count, 0),
  followers: user.followers,
};
const cards = [
  ['PUBLIC PROJECTS', snapshot.publicOriginalRepositories],
  ['PUBLIC FORKS', snapshot.publicForks],
  ['PROJECT STARS', snapshot.publicOriginalRepositoryStars],
  ['FOLLOWERS', snapshot.followers],
];
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="210" viewBox="0 0 1200 210" role="img" aria-labelledby="title desc">
<title id="title">Public GitHub profile statistics</title>
<desc id="desc">Public projects ${snapshot.publicOriginalRepositories}, public forks ${snapshot.publicForks}, stars on original public repositories ${snapshot.publicOriginalRepositoryStars}, followers ${snapshot.followers}. Updated ${snapshot.updatedAt} UTC.</desc>
<rect width="1200" height="210" rx="20" fill="#0c1c2a"/>
<g font-family="Arial,Helvetica,sans-serif">${cards.map(([label,value],index) => {
  const x = 32 + index * 294;
  return `<rect x="${x}" y="28" width="266" height="132" rx="12" fill="#142e3c"/><text x="${x + 22}" y="58" font-size="12" letter-spacing="1.2" fill="#93b3c1">${label}</text><text x="${x + 20}" y="120" font-size="46" font-weight="700" fill="#8ed9bd">${value}</text>`;
}).join('')}
<text x="32" y="190" font-size="12" fill="#8ca9b9">Public GitHub data · Updated ${snapshot.updatedAt} UTC · Project stars exclude forks</text></g></svg>`;
const assets = new URL('../assets/', import.meta.url);
await mkdir(assets, {recursive: true});
await writeFile(new URL('profile-stats.json', assets), `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(new URL('profile-stats.svg', assets), `${svg}\n`);
console.log('Refreshed public profile statistics.');
