// 360px 폭(모바일)에서 가로 스크롤이 생기는 페이지가 있는지 검사한다. 하나라도 있으면 exit 1.
//   node scripts/check-mobile.mjs [dist 폴더]   (CHROME=/path/to/chrome 로 브라우저 지정 가능)
// dist를 작은 로컬 서버로 띄우고, 헤드리스 Chrome(DevTools 프로토콜)으로 각 페이지의 scrollWidth를 잰다.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

const dist = path.resolve(process.argv[2] || 'dist');
const WIDTH = 360;
const chrome = process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(f => fs.existsSync(f));
if (!chrome) { console.error('Chrome을 찾을 수 없습니다 (CHROME 환경 변수로 지정)'); process.exit(2); }

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const cands = p.endsWith('/') ? [`${p}index.html`] : [p, `${p}.html`];
  const f = cands.map(c => path.join(dist, c)).find(c => c.startsWith(dist) && fs.existsSync(c) && fs.statSync(c).isFile());
  if (!f) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const pages = fs.readdirSync(dist, { recursive: true }).filter(f => f.endsWith('.html') && !f.endsWith('/index.html') || f === 'index.html')
  .map(f => '/' + f.split(path.sep).join('/').replace(/(index)?\.html$/, ''));

const proc = spawn(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${fs.mkdtempSync('/tmp/chrome-')}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  proc.stderr.on('data', d => { buf += d; const m = buf.match(/ws:\/\/[^\s]+/); if (m) resolve(m[0]); });
  setTimeout(() => reject(new Error('Chrome 시작 실패')), 20000);
});
const browser = new WebSocket(wsUrl);
await new Promise(r => browser.addEventListener('open', r));
let id = 0; const waiting = new Map(); const listeners = [];
browser.addEventListener('message', ev => {
  const msg = JSON.parse(ev.data);
  if (msg.id && waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); }
  else listeners.forEach(l => l(msg));
});
const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; waiting.set(i, r); browser.send(JSON.stringify({ id: i, method, params, sessionId })); });

const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 780, deviceScaleFactor: 2, mobile: true }, sessionId);

const bad = [];
for (const p of pages) {
  const loaded = new Promise(r => { const l = m => { if (m.method === 'Page.loadEventFired' && m.sessionId === sessionId) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
  await send('Page.navigate', { url: origin + p }, sessionId);
  await loaded;
  await new Promise(r => setTimeout(r, 150));
  const { result } = await send('Runtime.evaluate', { returnByValue: true, expression: `(() => {
    const de = document.documentElement, vw = de.clientWidth;
    const wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > vw + 0.5 && getComputedStyle(e).position !== 'fixed')
      .slice(0, 5).map(e => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '') + ' ' + Math.round(e.getBoundingClientRect().right));
    return { vw, sw: Math.max(de.scrollWidth, document.body.scrollWidth), wide };
  })()` }, sessionId);
  const v = result.result.value;
  const ok = v.sw <= v.vw && v.wide.length === 0;
  console.log(`${ok ? '✓' : '✗'} ${p.padEnd(24)} 화면 ${v.vw}px · 문서 ${v.sw}px${v.wide.length ? ' · 넘침: ' + v.wide.join(', ') : ''}`);
  if (!ok) bad.push(p);
}
// 덤: 실제 브라우저에서 채널 태그가 허용 값만 버튼 주소에 붙는지 확인한다
for (const p of pages.filter(p => p.startsWith('/partners/'))) {
  for (const [q, expectTag] of [['?ch=kakao', true], ['?ch=evil', false], ['', false]]) {
    const loaded = new Promise(r => { const l = m => { if (m.method === 'Page.loadEventFired' && m.sessionId === sessionId) { listeners.splice(listeners.indexOf(l), 1); r(); } }; listeners.push(l); });
    await send('Page.navigate', { url: origin + p + q }, sessionId);
    await loaded;
    const { result } = await send('Runtime.evaluate', { returnByValue: true, expression: `[...document.querySelectorAll('a[data-operator-cta]')].map(a => a.getAttribute('href'))` }, sessionId);
    const hrefs = result.result.value;
    const ok = hrefs.length > 0 && hrefs.every(h => expectTag ? /[?&]\w+=kakao(&|#|$)/.test(h) : !/evil|kakao/.test(h));
    console.log(`${ok ? '✓' : '✗'} ${p}${q || ' (채널 없음)'} → ${hrefs[0]}`);
    if (!ok) bad.push(p + q);
  }
}

browser.close(); proc.kill(); server.close();
console.log(`${WIDTH}px 폭 검사 ${pages.length}개 페이지 + 채널 태그 검사: 실패 ${bad.length}건`);
process.exit(bad.length ? 1 : 0);
