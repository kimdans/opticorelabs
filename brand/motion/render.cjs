// showreel.html을 한 프레임씩 넘기며 JPEG로 저장한다 (실시간 녹화가 아니라 결정적 렌더링).
// 출력 프레임률보다 촘촘히(기본 240fps) 찍어 두고, build.sh에서 여러 장을 평균해 모션 블러를 만든다.
//   node render.cjs <framesDir> [captureFps=240] [workers=4]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const [dir, capFps = '240', workers = '4'] = process.argv.slice(2);
const CAP = +capFps, W = +workers, DUR = 15, TOTAL = Math.round(DUR * CAP);
const page = 'file://' + path.join(__dirname, 'showreel.html');
fs.mkdirSync(dir, { recursive: true });

async function worker(k) {
  const from = Math.floor(TOTAL * k / W), to = Math.floor(TOTAL * (k + 1) / W);
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await p.goto(page);
  await p.evaluate(() => window.__capture());
  for (let n = from; n < to; n++) {
    await p.evaluate(t => window.__seek(t), n / CAP);
    await p.screenshot({ path: path.join(dir, String(n).padStart(6, '0') + '.jpg'), type: 'jpeg', quality: 97 });
    if (k === 0 && (n - from) % 100 === 0) console.log(`worker 0: ${n - from}/${to - from}`);
  }
  await browser.close();
}

(async () => {
  const t0 = Date.now();
  await Promise.all(Array.from({ length: W }, (_, k) => worker(k)));
  console.log(`rendered ${TOTAL} frames at ${CAP} fps in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
})();
