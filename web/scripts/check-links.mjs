// 빌드된 dist의 모든 내부 링크를 검사한다. 깨진 링크가 하나라도 있으면 exit 1.
//   node scripts/check-links.mjs [dist 폴더]
// 검사 대상: HTML의 href/src/srcset, CSS의 url(), sitemap.xml의 <loc>, llms*.txt의 마크다운 링크.
// 같은 사이트 주소(SITE_URL, 기본 https://opticorelabs.co.kr)로 시작하는 절대주소도 내부 링크로 본다.
// #조각이 있으면 대상 페이지에 그 id가 있는지도 확인한다.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] || 'dist');
const site = (process.env.SITE_URL || 'https://opticorelabs.co.kr').replace(/\/$/, '');
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist);
const rel = f => '/' + path.relative(dist, f).split(path.sep).join('/');

/** 사이트 경로(/a/b) → dist 안의 파일. 없으면 null */
function resolveFile(p) {
  if (!p.startsWith(base)) return null;
  let r = decodeURIComponent(p.slice(base.length));
  const cands = r === '' ? ['index.html'] : r.endsWith('/') ? [`${r}index.html`] : [r, `${r}.html`, `${r}/index.html`];
  for (const c of cands) {
    const f = path.join(dist, c);
    if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  }
  return null;
}

const idCache = new Map();
const idsOf = f => {
  if (!idCache.has(f)) idCache.set(f, new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1])));
  return idCache.get(f);
};

const broken = [];
let checked = 0;

function check(from, raw) {
  const ref = raw.trim().replace(/&amp;/g, '&');
  if (!ref || /^(mailto:|data:|javascript:)/i.test(ref)) return;
  if (/^tel:/i.test(ref)) { broken.push({ from, ref, why: '전화 링크 금지' }); return; }
  let abs;
  try { abs = new URL(ref, site + (from.endsWith('.html') || from.endsWith('.css') ? from : '/')); } catch { broken.push({ from, ref, why: '주소 형식 오류' }); return; }
  if (abs.origin !== new URL(site).origin) return; // 외부 링크는 검사하지 않는다
  checked++;
  const target = abs.pathname === '' ? base : abs.pathname;
  const f = resolveFile(target);
  if (!f) { broken.push({ from, ref, why: '대상 없음' }); return; }
  const frag = decodeURIComponent(abs.hash.slice(1));
  if (frag && f.endsWith('.html') && !idsOf(f).has(frag)) broken.push({ from, ref, why: `#${frag} 없음` });
}

for (const f of files) {
  const from = rel(f);
  const text = /\.(html|css|xml|txt)$/.test(f) ? fs.readFileSync(f, 'utf8') : '';
  if (f.endsWith('.html')) {
    const noScripts = text.replace(/<script[\s\S]*?<\/script>/g, '');
    for (const m of noScripts.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
      // 같은 페이지 안의 #조각
      if (m[1].startsWith('#')) {
        checked++;
        const id = decodeURIComponent(m[1].slice(1));
        if (id && !idsOf(f).has(id)) broken.push({ from, ref: m[1], why: `#${id} 없음` });
      } else check(from, m[1]);
    }
    for (const m of noScripts.matchAll(/\ssrcset="([^"]*)"/g)) m[1].split(',').forEach(s => check(from, s.trim().split(/\s+/)[0]));
  } else if (f.endsWith('.css')) {
    for (const m of text.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) check(from, m[1]);
  } else if (f.endsWith('.xml')) {
    for (const m of text.matchAll(/<loc>([^<]+)<\/loc>/g)) check(from, m[1]);
  } else if (f.endsWith('.txt')) {
    for (const m of text.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) check(from, m[1]);
    for (const m of text.matchAll(/^Sitemap:\s*(\S+)/gm)) check(from, m[1]);
  }
}

for (const b of broken) console.log(`✗ ${b.from} → ${b.ref} (${b.why})`);
console.log(`내부 링크 ${checked}개 검사, 깨진 링크 ${broken.length}건 (${dist})`);
process.exit(broken.length ? 1 : 0);
