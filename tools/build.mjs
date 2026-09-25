// Release build: public/ -> www/ (served by Firebase Hosting and packed into the Android app).
//  - copies the site
//  - re-encodes music and stings to 96 kbps MP3 (cached in .cache/audio, so only changed files are redone)
//  - stamps the version from package.json into index.html (<meta name="<package name>-version">)
// Usage: node tools/build.mjs            (needs ffmpeg: set FFMPEG=path, or `npm install` brings ffmpeg-static)
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, statSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'public'), out = join(root, 'www'), cache = join(root, '.cache', 'audio');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const BITRATE = process.env.AUDIO_KBPS || '96';

async function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { return (await import('ffmpeg-static')).default; } catch { return null; }
}
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]);

rmSync(out, { recursive: true, force: true });
cpSync(src, out, { recursive: true, filter: p => !/(^|[\\/])\./.test(relative(src, p)) });

// version stamp
const ver = `${pkg.version} (${pkg.androidVersionCode})`;
const idx = join(out, 'index.html');
writeFileSync(idx, readFileSync(idx, 'utf8').replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<meta name="${pkg.name}-version" content="${ver}">`));

// audio
const ff = await ffmpegPath();
const mp3s = (existsSync(join(out, 'audio')) ? walk(join(out, 'audio')) : []).filter(f => f.endsWith('.mp3'));
let before = 0, after = 0;
if (!ff) console.warn('! ffmpeg not found: audio copied uncompressed (npm install, or set FFMPEG=...)');
for (const f of mp3s) {
  const orig = join(src, relative(out, f)), st = statSync(orig); before += st.size;
  if (!ff) { after += st.size; continue; }
  const key = createHash('sha1').update(`${relative(src, orig)}|${st.size}|${st.mtimeMs}|${BITRATE}`).digest('hex');
  const cached = join(cache, key + '.mp3');
  if (!existsSync(cached)) {
    mkdirSync(cache, { recursive: true });
    execFileSync(ff, ['-v', 'error', '-y', '-i', orig, '-map_metadata', '-1', '-ac', '2', '-ar', '44100', '-b:a', `${BITRATE}k`, cached]);
  }
  const small = statSync(cached).size;
  if (small < st.size) copyFileSync(cached, f); // keep the original if it was already smaller
  after += Math.min(small, st.size);
}
const mb = n => (n / 1048576).toFixed(1) + ' MB';
console.log(`www/ built · version ${ver} · audio ${mb(before)} -> ${mb(after)} (${mp3s.length} files, ${BITRATE} kbps)`);
