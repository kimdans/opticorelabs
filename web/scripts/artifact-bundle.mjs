// 빌드된 사이트를 Claude 아티팩트로 올릴 수 있는 묶음으로 바꾼다.
// 아티팩트는 "/"로 시작하는 주소를 쓸 수 없어서, 모든 내부 링크를 파일 사이의 상대 경로로 고친다.
//   BASE_PATH=/__B__ OUT_DIR=<빌드 폴더> npx astro build
//   node scripts/artifact-bundle.mjs <빌드 폴더> <출력 폴더>
// 출력 폴더의 index.html이 아티팩트 본문이고, 나머지는 함께 올리는 파일이다 (files.json에 목록).
import fs from 'node:fs';
import path from 'node:path';

const [src, out] = process.argv.slice(2);
const BASE = '/__B__';
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(src).map(f => path.relative(src, f));
const pages = new Set(files.filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, '')));

fs.rmSync(out, { recursive: true, force: true });
const manifest = {};
for (const rel of files) {
  if (rel === 'sitemap.xml' || rel === 'robots.txt') continue;           // 아티팩트에서는 의미가 없다
  const to = path.join(out, rel.replace(/^_astro/, 'assets'));   // 아티팩트는 '_'로 시작하는 경로를 쓸 수 없다
  fs.mkdirSync(path.dirname(to), { recursive: true });
  const up = '../'.repeat(rel.split(path.sep).length - 1) || './';       // './'가 있어야 스크립트의 import 경로로도 유효하다
  if (/\.(html|css|js|txt)$/.test(rel)) {
    let s = fs.readFileSync(path.join(src, rel), 'utf8');
    s = s.replaceAll('https://kimdans.github.io' + BASE, 'https://kimdans.github.io/opticorelabs');   // 절대 주소는 실제 배포 주소로
    // "/__B__/method" → "method.html", "/__B__/" → "index.html", 그 밖의 파일은 경로만 상대화
    s = s.replace(new RegExp(BASE + '(/[A-Za-z0-9_./-]*)?', 'g'), (_, p = '/') => {
      const clean = p.replace(/^\//, '');
      if (clean === '') return up + 'index.html';
      return up + (pages.has(clean) ? clean + '.html' : clean);
    });
    s = s.replaceAll('_astro/', 'assets/');
    if (rel === 'index.html') {
      // 아티팩트 본문은 게시할 때 문서 뼈대로 감싸지므로 head와 body의 안쪽만 남긴다.
      const head = s.match(/<head[^>]*>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>|<link rel="canonical"[^>]*>/g, '');
      const body = s.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1];
      s = head.replace(/<title>[\s\S]*?<\/title>/, '<title>OptiCore 웹사이트</title>\n<meta name="claude:viewport-fit-sides" content="cover">') + body;
    }
    fs.writeFileSync(to, s);
  } else fs.copyFileSync(path.join(src, rel), to);
  if (rel !== 'index.html') manifest[path.relative(out, to).split(path.sep).join('/')] = to;
}
fs.writeFileSync(path.join(out, 'files.json'), JSON.stringify(manifest, null, 1));
console.log(`bundled ${Object.keys(manifest).length + 1} files → ${out}`);
