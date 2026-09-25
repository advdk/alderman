#!/usr/bin/env node
// Google Play publishing for Alderman, via the Android Publisher API (v3).
// Used by .github/workflows/play-*.yml; also runs locally with Application Default Credentials.
//
//   node tools/play.mjs upload  --aab <file> [--track internal] [--status completed|draft] [--notes store/whatsnew]
//   node tools/play.mjs promote --from internal --to production [--fraction 0.2] [--status inProgress|completed|draft]
//   node tools/play.mjs rollout --track production --fraction 0.5      (1 = complete the rollout)
//   node tools/play.mjs halt    --track production                      (pause a staged rollout)
//   node tools/play.mjs status                                          (show every track)
//
// Credentials: Google Application Default Credentials. In GitHub Actions this is the keyless
// Workload Identity Federation login done by google-github-actions/auth (no JSON key is stored).
// The service account must be invited in Play Console -> Users and permissions with release rights.
//
// Note: until the app has been published once (reviewed), Play only accepts *draft* releases.
// Use --status draft for those first uploads and roll them out from Play Console.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth } from 'google-auth-library';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = process.env.PLAY_PACKAGE || JSON.parse(readFileSync(join(root, 'capacitor.config.json'), 'utf8')).appId;
const BASE = process.env.PLAY_API_BASE || 'https://androidpublisher.googleapis.com';   // override only for tests
const API = `${BASE}/androidpublisher/v3/applications/${PACKAGE}`;
const UPLOAD = `${BASE}/upload/androidpublisher/v3/applications/${PACKAGE}`;
const TRACKS = ['internal', 'alpha', 'beta', 'production'];   // alpha = closed testing, beta = open testing

// ---------- args ----------
const [cmd, ...rest] = process.argv.slice(2);
const opt = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith('--')) continue;
  const k = rest[i].slice(2), v = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : 'true';
  opt[k] = v;
}
const die = m => { console.error(`✖ ${m}`); process.exit(1); };
const track = (t, name) => { if (!TRACKS.includes(t)) die(`${name} must be one of ${TRACKS.join(', ')} (got "${t}")`); return t; };
const fraction = f => { const n = Number(f); if (!(n > 0 && n <= 1)) die(`--fraction must be > 0 and ≤ 1 (got "${f}")`); return n; };

// ---------- API ----------
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
let token;
async function call(method, url, body, headers = {}) {
  token = token || process.env.PLAY_ACCESS_TOKEN || (await (await auth.getClient()).getAccessToken()).token;
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body && !(body instanceof Buffer) ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body instanceof Buffer ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text; try { msg = JSON.parse(text).error.message; } catch {}
    throw new Error(`${method} ${url.replace(API, '').replace(UPLOAD, '') || '/'} -> ${res.status}: ${msg}`);
  }
  return text ? JSON.parse(text) : {};
}
const edit = {
  open: async () => (await call('POST', `${API}/edits`, {})).id,
  getTrack: (id, t) => call('GET', `${API}/edits/${id}/tracks/${t}`).catch(e => { if (/404/.test(e.message)) return { track: t, releases: [] }; throw e; }),
  setTrack: (id, t, releases) => call('PUT', `${API}/edits/${id}/tracks/${t}`, { track: t, releases }),
  commit: (id, sendForReview = true) => call('POST', `${API}/edits/${id}:commit${sendForReview ? '' : '?changesNotSentForReview=true'}`),
  abort: id => call('DELETE', `${API}/edits/${id}`).catch(() => {}),
};

// store/whatsnew/<lang>.txt  ->  [{language, text}]  (Play limit: 500 characters each)
function releaseNotes(dir) {
  const d = join(root, dir || 'store/whatsnew');
  if (!existsSync(d) || !statSync(d).isDirectory()) return undefined;
  const notes = readdirSync(d).filter(f => f.endsWith('.txt')).map(f => ({ language: f.replace(/\.txt$/, ''), text: readFileSync(join(d, f), 'utf8').trim() }));
  for (const n of notes) if (n.text.length > 500) die(`release notes ${n.language} are ${n.text.length} characters; Play allows 500`);
  return notes.length ? notes : undefined;
}
const release = ({ versionCodes, status, frac, name, notes }) => {
  const r = { versionCodes: versionCodes.map(String), status };
  if (name) r.name = name;
  if (notes) r.releaseNotes = notes;
  if (status === 'inProgress' || status === 'halted') r.userFraction = frac;
  return r;
};
const show = (t, rel) => `${t}: ${rel.status}${rel.userFraction ? ` ${Math.round(rel.userFraction * 100)}%` : ''} · versions ${(rel.versionCodes || []).join(', ') || '–'}${rel.name ? ` · "${rel.name}"` : ''}`;
// GitHub job summary, when running in Actions
const summary = async lines => { if (process.env.GITHUB_STEP_SUMMARY) { const { appendFileSync } = await import('node:fs'); appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n'); } };

// ---------- commands ----------
async function upload() {
  const aab = opt.aab || die('--aab <file> is required');
  if (!existsSync(aab)) die(`no such file: ${aab}`);
  const t = track(opt.track || 'internal', '--track'), status = opt.status || 'completed';
  if (!['completed', 'draft'].includes(status)) die('--status for upload must be completed or draft');
  const id = await edit.open();
  try {
    console.log(`Uploading ${aab} (${(statSync(aab).size / 1048576).toFixed(1)} MB) to ${PACKAGE}…`);
    const b = await call('POST', `${UPLOAD}/edits/${id}/bundles?uploadType=media`, readFileSync(aab), { 'Content-Type': 'application/octet-stream' });
    const rel = release({ versionCodes: [b.versionCode], status, name: opt.name, notes: releaseNotes(opt.notes) });
    await edit.setTrack(id, t, [rel]);
    await edit.commit(id);
    console.log(`✔ ${show(t, rel)}`);
    await summary([`### Google Play`, `Uploaded **${opt.name || 'version ' + b.versionCode}** (versionCode ${b.versionCode}) to **${t}** as *${status}*.`]);
  } catch (e) { await edit.abort(id); throw e; }
}

async function promote() {
  const from = track(opt.from || 'internal', '--from'), to = track(opt.to || die('--to is required'), '--to');
  if (from === to) die('--from and --to are the same track');
  const status = opt.status || (to === 'production' ? 'inProgress' : 'completed');
  const frac = status === 'inProgress' ? fraction(opt.fraction || '0.2') : undefined;
  const id = await edit.open();
  try {
    const src = (await edit.getTrack(id, from)).releases || [];
    const live = src.find(r => r.status === 'completed') || src.find(r => r.status === 'inProgress') || src[0];
    if (!live) die(`nothing on ${from} to promote`);
    const rel = release({ versionCodes: live.versionCodes, status, frac, name: live.name, notes: live.releaseNotes });
    // a staged rollout keeps the release that is already serving everyone else on that track
    const keep = status === 'inProgress' ? ((await edit.getTrack(id, to)).releases || []).filter(r => r.status === 'completed') : [];
    await edit.setTrack(id, to, [...keep, rel]);
    await edit.commit(id);
    console.log(`✔ promoted ${from} -> ${show(to, rel)}`);
    await summary([`### Google Play`, `Promoted **${live.name || live.versionCodes.join(', ')}** from ${from} to **${to}** (${status}${frac ? `, ${Math.round(frac * 100)}%` : ''}).`]);
  } catch (e) { await edit.abort(id); throw e; }
}

async function rollout(halt = false) {
  const t = track(opt.track || 'production', '--track');
  const id = await edit.open();
  try {
    const rels = (await edit.getTrack(id, t)).releases || [];
    const staged = rels.find(r => r.status === 'inProgress' || r.status === 'halted');
    if (!staged) die(`no staged rollout on ${t}`);
    let rel;
    if (halt) rel = { ...staged, status: 'halted' };
    else {
      const f = fraction(opt.fraction || die('--fraction is required (1 = everyone)'));
      rel = f === 1 ? { ...staged, status: 'completed' } : { ...staged, status: 'inProgress', userFraction: f };
      if (f === 1) delete rel.userFraction;
    }
    // keep a completed release that is still serving the rest of the users while the staged one rolls out
    const others = rels.filter(r => r !== staged && r.status === 'completed' && rel.status !== 'completed');
    await edit.setTrack(id, t, [...others, rel]);
    await edit.commit(id);
    console.log(`✔ ${show(t, rel)}`);
    await summary([`### Google Play`, `${t}: **${rel.status}**${rel.userFraction ? ` at ${Math.round(rel.userFraction * 100)}%` : ''} (versions ${rel.versionCodes.join(', ')}).`]);
  } catch (e) { await edit.abort(id); throw e; }
}

async function status() {
  const id = await edit.open();
  try {
    const { tracks = [] } = await call('GET', `${API}/edits/${id}/tracks`);
    const lines = tracks.flatMap(t => (t.releases || []).map(r => show(t.track, r)));
    console.log(lines.length ? lines.join('\n') : 'No releases yet.');
    await summary(['### Google Play tracks', ...lines.map(l => `- ${l}`)]);
  } finally { await edit.abort(id); }
}

const commands = { upload, promote, rollout: () => rollout(false), halt: () => rollout(true), status };
if (!commands[cmd]) die(`usage: node tools/play.mjs <${Object.keys(commands).join('|')}> [options]  (see the top of this file)`);
commands[cmd]().catch(e => die(e.message));
