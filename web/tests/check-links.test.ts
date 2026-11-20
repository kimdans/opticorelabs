// scripts/check-links.mjs 가 깨진 링크를 실제로 잡아내는지 작은 가짜 dist로 확인한다.
import { describe, it, expect, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dirs: string[] = [];
afterAll(() => dirs.forEach(d => fs.rmSync(d, { recursive: true, force: true })));

function fakeDist(files: Record<string, string>) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'opticore-links-'));
  dirs.push(d);
  for (const [f, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true });
    fs.writeFileSync(path.join(d, f), body);
  }
  return d;
}
const run = (d: string) => spawnSync(process.execPath, ['scripts/check-links.mjs', d], { encoding: 'utf8', env: { ...process.env, SITE_URL: 'https://opticorelabs.co.kr', BASE_PATH: '/' } });

describe('check-links.mjs', () => {
  it('모든 링크가 살아 있으면 0건, exit 0', () => {
    const d = fakeDist({
      'index.html': '<a href="/company">회사</a><a href="#how">방법</a><h2 id="how">x</h2><a href="https://opticorelabs.co.kr/partners/a">a</a><a href="mailto:x@y.z">m</a><a href="https://other.example/">외부</a>',
      'company.html': '<a href="/#how">홈 방법</a>',
      'partners/a.html': '<a href="/">홈</a>',
    });
    const r = run(d);
    expect(r.stdout).toContain('깨진 링크 0건');
    expect(r.status).toBe(0);
  });

  it('없는 페이지, 없는 #조각, 전화 링크를 잡아내고 exit 1', () => {
    const d = fakeDist({
      'index.html': '<a href="/nope">x</a><a href="#missing">y</a><a href="/company#gone">z</a><a href="tel:0000">t</a>',
      'company.html': '<p id="here">c</p>',
    });
    const r = run(d);
    expect(r.stdout).toContain('깨진 링크 4건');
    expect(r.status).toBe(1);
  });
});
