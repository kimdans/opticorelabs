// 빌드 결과(HTML)를 검사한다. 테스트가 직접 임시 폴더에 운영 설정(https://opticorelabs.co.kr, base "/")으로 빌드한다.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { partners, publishedPartners } from '../src/data/partners';
import { business } from '../src/data/business';
import { company } from '../src/data/site';

const SITE = 'https://opticorelabs.co.kr';
let out = '';
let pages: { file: string; html: string; text: string }[] = [];

/** 사람이 보는 글자 + meta 내용 (스크립트·스타일·주석 제외) */
const visible = (html: string) => {
  const metas = [...html.matchAll(/<meta[^>]+content="([^"]*)"/g)].map(m => m[1]).join('\n');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return `${title}\n${metas}\n${body}`;
};

beforeAll(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), 'opticore-dist-'));
  execFileSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
    env: { ...process.env, NODE_ENV: 'production', SITE_URL: SITE, BASE_PATH: '/', OUT_DIR: out },
    stdio: 'pipe',
  });
  const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  pages = walk(out).filter(f => f.endsWith('.html')).map(f => {
    const html = fs.readFileSync(f, 'utf8');
    return { file: path.relative(out, f), html, text: visible(html) };
  });
}, 180_000);

afterAll(() => { if (out) fs.rmSync(out, { recursive: true, force: true }); });

const read = (rel: string) => fs.readFileSync(path.join(out, rel), 'utf8');

describe('빌드된 사이트', () => {
  it('필요한 페이지가 모두 있고, 예전 IT 페이지는 없다', () => {
    const files = pages.map(p => p.file);
    for (const f of ['index.html', 'company.html', 'partners.html', 'terms.html', 'privacy.html', '404.html']) expect(files).toContain(f);
    for (const p of publishedPartners()) expect(files).toContain(`partners/${p.slug}.html`);
    for (const f of ['method.html', 'principles.html', 'diagnose.html', 'lenses.html']) expect(files).not.toContain(f);
    expect(fs.existsSync(path.join(out, 'lenses'))).toBe(false);
    expect(fs.existsSync(path.join(out, 'film'))).toBe(false);
  });

  it('IT 개발·컨설팅 금지어가 HTML과 llms·sitemap 어디에도 없다', () => {
    const banned = [/(?<![A-Za-z])SI(?![A-Za-z])/, /(?<![A-Za-z])ERP(?![A-Za-z])/i, /(?<![A-Za-z])AX(?![A-Za-z])/, /AI\s*전환/, /SaaS/i, /에이전트/, /시스템\s*통합/, /상태\s*머신/, /진단/];
    const texts = [
      ...pages.map(p => [p.file, p.text] as const),
      ...['llms.txt', 'llms-full.txt', 'sitemap.xml', 'robots.txt'].map(f => [f, read(f)] as const),
    ];
    for (const [file, text] of texts) for (const re of banned) expect(text, `${file}: ${re}`).not.toMatch(re);
  });

  it("IT 관련 표현은 '주요 사업' 한 줄('소프트웨어 개발·공급', '경영·정보기술 컨설팅')에서만 허용한다", () => {
    const texts = [
      ...pages.map(p => [p.file, p.text] as const),
      ...['llms.txt', 'llms-full.txt'].map(f => [f, read(f)] as const),
    ];
    for (const [file, text] of texts) {
      const rest = text.split(company.businessLine).join(' ');
      expect(rest, file).not.toMatch(/소프트웨어|컨설팅|정보기술|(?<![A-Za-z])IT(?![A-Za-z])|개발/);
    }
    for (const f of ['company.html', 'index.html']) expect(read(f), f).toContain(company.businessLine);
    expect(company.businessLine).toBe('주요 사업: 온라인 서비스 안내·마케팅(통신판매업 신고), 소프트웨어 개발·공급, 경영·정보기술 컨설팅');
  });

  it('초안(draft) 제휴 안내는 빌드 결과 어디에도 없다 (페이지·목록·sitemap·llms·스크립트)', () => {
    const drafts = partners.filter(p => p.draft);
    for (const p of drafts) {
      expect(fs.existsSync(path.join(out, 'partners', `${p.slug}.html`)), p.slug).toBe(false);
      expect(fs.existsSync(path.join(out, 'partners', p.slug)), p.slug).toBe(false);
    }
    const walk = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    const textFiles = walk(out).filter(f => /\.(html|txt|xml|js|css|json|svg)$/.test(f));
    const needles: (string | RegExp)[] = [/밀당|mildang|1등급/i, ...drafts.flatMap(p => [p.slug, p.title, p.summary, p.campaignName])];
    for (const f of textFiles) {
      const t = fs.readFileSync(f, 'utf8');
      for (const n of needles) {
        if (typeof n === 'string') expect(t.includes(n), `${path.relative(out, f)}: ${n.slice(0, 30)}`).toBe(false);
        else expect(t, path.relative(out, f)).not.toMatch(n);
      }
    }
  });

  it('사실이 아닌 실적·보증·평가 표현이 화면 문구와 llms에 없다', () => {
    const claims = /실적|공식\s*파트너|공식\s*제휴|검증된|다수의\s*제휴|제휴사\s*\d|고객\s*수|만족도|순위|1위|최고|보장|믿을\s*만한|신뢰할\s*수\s*있는|\d+\s*(명|건|곳|개사|%)/;
    const texts = [...pages.map(p => [p.file, p.text] as const), ...['llms.txt', 'llms-full.txt'].map(f => [f, read(f)] as const)];
    for (const [file, text] of texts) expect(text.replace(/©\s*\d{4}/g, ''), file).not.toMatch(claims);
  });

  it('공개된 제휴 안내가 없으면 목록에 정직한 빈 상태 문구와 이용 방식 설명이 나온다', () => {
    if (publishedPartners().length) return;
    for (const f of ['partners.html', 'index.html']) {
      const h = read(f);
      expect(h, f).toContain('data-partners-empty');
      expect(h, f).toContain('현재 공개된 제휴 안내가 없습니다.');
      expect(h, f).toContain('제휴 업체 확인이 끝나면 이곳에 안내합니다.');
      expect(h, f).not.toContain('준비 중');
    }
  });

  it('회사 정보에 사업 영역 한 줄과 광고주 문장이 있고, 연락처는 이메일 하나뿐이다', () => {
    const h = read('company.html');
    expect(h).toContain(company.businessLine);
    expect(h).toContain('이 사이트와 광고의 광고주는 주식회사 옵티코어입니다.');
    for (const p of pages) {
      const mails = new Set([...p.html.matchAll(/mailto:([^"?]+)/g)].map(m => m[1]));
      expect([...mails], p.file).toEqual(['contact@opticorelabs.co.kr']);
    }
  });

  it('이용약관에 필요한 항목과 법률 검토 표시가 있다', () => {
    const html = read('terms.html');
    for (const s of ['안내만 합니다', '각 제휴 업체와 이용자 사이에서 이루어지며', '결제', '환불', '수수료를 받을 수 있습니다', '안내용 정보', business.email, '시행일: 2026년 11월 20일']) expect(html).toContain(s);
    expect(html).toMatch(/<!--\s*법률 검토 필요/);
    expect(read('sitemap.xml')).toContain(`${SITE}/terms`);
    expect(read('llms.txt')).toContain(`${SITE}/terms`);
  });

  it('제외 업종(의료·법률·대출·건강식품·주식교육)과 전화번호가 화면 문구에 없다', () => {
    for (const p of pages) {
      expect(p.text, p.file).not.toMatch(/의료|법률|대출|건강식품|주식\s*교육|주식\s*강의/);
      expect(p.text, p.file).not.toMatch(/\b0\d{1,2}-\d{3,4}-\d{4}\b|1[568]\d{2}-\d{4}/);
      expect(p.html, p.file).not.toMatch(/href="tel:|kakao\.com|pf\.kakao/i);
    }
  });

  it('개인정보 입력폼·쿠키·분석 스크립트·자동 이동이 없다', () => {
    for (const p of pages) {
      expect(p.html, p.file).not.toMatch(/<form|<input|<textarea|<select/i);
      expect(p.html, p.file).not.toMatch(/document\.cookie|gtag|googletagmanager|google-analytics|dataLayer|fbq\(|wcs_do|kakaoPixel/i);
      expect(p.html, p.file).not.toMatch(/http-equiv="refresh"|location\.(href|replace|assign)\s*[=(]|window\.location\s*=/i);
    }
  });

  it('모든 페이지에 사업자 정보 푸터와 개인정보 처리방침 링크가 있다', () => {
    const digits = business.bizNo.replace(/\D/g, '');
    for (const p of pages) {
      for (const v of [business.name, business.ceo, business.bizNo, business.mailOrderNo, business.address, business.email]) expect(p.html, `${p.file}: ${v}`).toContain(v);
      expect(p.html, p.file).toContain(`https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${digits}`);
      expect(p.html, p.file).toMatch(/href="\/privacy"/);
      expect(p.html, p.file).toMatch(/href="\/terms"/);
      expect(p.html, p.file).toMatch(/©/);
    }
  });

  it('title·description은 페이지마다 다르고, canonical·og:url은 https 절대주소다', () => {
    const real = pages.filter(p => !p.file.endsWith('/index.html')); // 폴더용 사본(partners/index.html)은 같은 페이지
    const titles = real.map(p => p.html.match(/<title>([^<]+)<\/title>/)?.[1]);
    const descs = real.map(p => p.html.match(/<meta name="description" content="([^"]+)"/)?.[1]);
    titles.forEach((t, i) => expect(t, real[i].file).toBeTruthy());
    descs.forEach((d, i) => expect(d, real[i].file).toBeTruthy());
    expect(new Set(titles).size).toBe(real.length);
    expect(new Set(descs).size).toBe(real.length);
    for (const p of real.filter(p => p.file !== '404.html')) {
      const canon = p.html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(canon, p.file).toMatch(/^https:\/\/opticorelabs\.co\.kr\//);
      expect(p.html, p.file).toContain(`<meta property="og:url" content="${canon}">`);
    }
  });

  it('404 페이지는 noindex이고 홈으로 가는 링크가 있다', () => {
    const html = read('404.html');
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).toMatch(/href="\/"/);
  });

  it('개인정보 처리방침에 필요한 항목과 법률 검토 표시가 있다', () => {
    const html = read('privacy.html');
    for (const s of ['개인정보를 수집하지 않습니다', '제휴 업체가 직접 수집·처리', '접속 기록', '이메일 문의', '개인정보 보호책임자', business.email, '시행일: 2026년 11월 20일']) expect(html).toContain(s);
    expect(html).toMatch(/<!--\s*법률 검토 필요/);
  });
});

// 공개(draft: false) 항목만 페이지가 만들어진다. 공개 항목이 없으면 이 묶음은 건너뛴다.
describe.each(publishedPartners().map(p => [p.slug, p] as const))('제휴 안내 페이지 /partners/%s', (slug, p) => {
  const html = () => read(`partners/${slug}.html`);

  it('서비스 제공자와 제휴 안내 문구가 본문 위쪽에 있다', () => {
    const h = html();
    const main = h.slice(h.indexOf('<main'));
    const provider = main.search(new RegExp(`서비스 제공: <strong[^>]*>${p.provider.replace(/[[\]]/g, '\\$&')}</strong>`));
    const disclosure = main.indexOf(`이 페이지는 주식회사 옵티코어가 제휴 업체의 서비스를 안내하는 페이지입니다. 상담 신청과 서비스 제공은 ${p.provider}에서 직접 진행하며, 옵티코어는 신청 정보를 받거나 보관하지 않습니다. 옵티코어는 제휴에 따른 수수료를 받을 수 있습니다.`);
    expect(provider).toBeGreaterThan(-1);
    expect(disclosure).toBeGreaterThan(-1);
    // 첫 번째 상담 신청 버튼보다 앞에 나온다
    expect(disclosure).toBeLessThan(main.indexOf('data-operator-cta'));
  });

  it('상담 신청 버튼은 운영사 주소로 같은 탭에서 이동한다 (target 없음)', () => {
    const ctas = [...html().matchAll(/<a [^>]*data-operator-cta[^>]*>/g)].map(m => m[0]);
    expect(ctas.length).toBeGreaterThan(0);
    for (const a of ctas) {
      expect(a).toContain(`href="${p.operatorUrl}"`);
      expect(a).not.toMatch(/\starget=/);
      expect(a).toContain(`data-channel-param="${p.channelParam || 'ch'}"`);
    }
  });

  it('채널 태그 스크립트는 허용 목록과 함께 인라인으로 들어 있다', () => {
    expect(html()).toMatch(/<script>\(function\(\)\{var f=\(function applyChannel[\s\S]*\["daangn","kakao","naver","toss","meta"\]/);
  });

  it('어떤 분께 맞는지·진행 방식·확인할 점·자주 묻는 질문이 모두 있다', () => {
    const h = html();
    for (const s of ['이런 분께 맞습니다', '진행 방식', '신청 전에 확인할 점', '자주 묻는 질문']) expect(h).toContain(s);
    p.faq.forEach(f => expect(h).toContain(f.q));
  });

  it('공개 항목이라 noindex가 없고 sitemap·목록에 있다', () => {
    expect(html()).not.toContain('noindex');
    expect(read('sitemap.xml')).toContain(`${SITE}/partners/${slug}`);
    expect(read('partners.html')).toContain(`href="/partners/${slug}"`);
  });
});
