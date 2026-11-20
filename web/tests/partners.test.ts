import { describe, it, expect } from 'vitest';
import { partners, publishedPartners, CATEGORIES } from '../src/data/partners';
import { CHANNELS } from '../src/lib/channel';
import { llmsShort, llmsFull } from '../src/lib/llms';

describe('제휴 안내 데이터', () => {
  it('slug는 소문자·숫자·하이픈이고 서로 겹치지 않는다', () => {
    const slugs = partners.map(p => p.slug);
    slugs.forEach(s => expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it.each(partners.map(p => [p.slug, p] as const))('%s: operatorUrl은 https 절대주소다', (_, p) => {
    const u = new URL(p.operatorUrl);
    expect(u.protocol).toBe('https:');
  });

  it.each(partners.map(p => [p.slug, p] as const))('%s: 페이지가 혼자서도 완성되도록 필요한 내용이 다 있다', (_, p) => {
    expect(p.title.trim()).not.toBe('');
    expect(p.provider.trim()).not.toBe('');
    expect(CATEGORIES).toContain(p.category);
    expect(p.summary.length).toBeGreaterThan(80);
    expect(p.audience.length).toBeGreaterThanOrEqual(2);
    expect(p.steps.length).toBeGreaterThanOrEqual(2);
    expect(p.checks.length).toBeGreaterThanOrEqual(2);
    expect(p.faq.length).toBeGreaterThanOrEqual(3);
    expect(p.faq.length).toBeLessThanOrEqual(5);
    p.images.forEach(im => expect(im.alt.trim()).not.toBe(''));
    if (p.channelParam !== undefined) expect(p.channelParam).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
  });

  it('초안 항목에는 승인 메모가 있고, 공개 목록·sitemap·llms 에서 빠진다', () => {
    const drafts = partners.filter(p => p.draft);
    drafts.forEach(p => expect(p.approvalNote?.trim()).toBeTruthy());
    const pub = publishedPartners();
    drafts.forEach(p => {
      expect(pub).not.toContain(p);
      expect(llmsShort('https://opticorelabs.co.kr/')).not.toContain(`/partners/${p.slug}`);
      expect(llmsFull('https://opticorelabs.co.kr/')).not.toContain(p.title);
    });
  });

  it('공개 항목의 운영사 주소는 예시 주소가 아니고, 제공자 이름도 확인 필요 표시가 아니다', () => {
    publishedPartners().forEach(p => {
      expect(p.operatorUrl).not.toMatch(/example\.com|REPLACE/i);
      expect(p.provider).not.toMatch(/확인 필요/);
    });
  });

  it('mildang-pt 항목은 운영사 확인 전 초안 상태다', () => {
    const p = partners.find(x => x.slug === 'mildang-pt')!;
    expect(p).toBeDefined();
    expect(p.draft).toBe(true);
    expect(p.approvalNote).toBe('needs operator written OK (Q-014)');
    expect(p.provider).toBe('[운영사 확인 필요]');
    expect(p.campaignName).toBe('밀당PT, 1등급 전략');
    expect(p.category).toBe('교육');
    expect(p.images.every(im => !im.src)).toBe(true);
  });

  it('공개 문구에 성적·효과 보장 같은 과장 표현이 없다', () => {
    partners.forEach(p => {
      const text = [p.title, p.summary, ...p.audience, ...p.steps, ...p.checks, ...p.faq.flatMap(f => [f.q, f.a])].join('\n');
      expect(text).not.toMatch(/보장|1등급|1위|최고|100%|무조건|확실히/);
    });
  });

  it('채널 허용 목록은 정해진 다섯 개다', () => {
    expect([...CHANNELS]).toEqual(['daangn', 'kakao', 'naver', 'toss', 'meta']);
  });
});
