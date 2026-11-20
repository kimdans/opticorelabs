import { describe, it, expect } from 'vitest';
import { applyChannel, CHANNELS } from '../src/lib/channel';

const OP = 'https://partner.example/apply';

describe('applyChannel (채널 태그)', () => {
  it.each(CHANNELS.map(c => [c]))('허용 채널 %s 는 버튼 주소에 붙는다', c => {
    expect(applyChannel(OP, `?ch=${c}`, 'ch', CHANNELS)).toBe(`${OP}?ch=${c}`);
  });

  it('허용 목록 밖의 값은 무시하고 기본 주소를 그대로 둔다', () => {
    for (const s of ['?ch=google', '?ch=KAKAO', '?ch=kakao%20', '?ch=', '?ch=<script>', '?ch=evil&ch=naver']) {
      expect(applyChannel(OP, s, 'ch', CHANNELS)).toBe(OP);
    }
  });

  it('ch 가 없으면 기본 주소 그대로', () => {
    expect(applyChannel(OP, '', 'ch', CHANNELS)).toBe(OP);
    expect(applyChannel(OP, '?utm_source=x', 'ch', CHANNELS)).toBe(OP);
  });

  it('데이터 항목의 channelParam 이름으로 붙인다', () => {
    expect(applyChannel(OP, '?ch=toss', 'src', CHANNELS)).toBe(`${OP}?src=toss`);
  });

  it('파라미터 이름이 비어 있으면 기본값 ch 를 쓴다', () => {
    expect(applyChannel(OP, '?ch=meta', '', CHANNELS)).toBe(`${OP}?ch=meta`);
  });

  it('운영사 주소에 이미 있는 파라미터와 #조각은 유지하고, 같은 이름은 덮어쓴다', () => {
    expect(applyChannel('https://p.example/a?x=1#f', '?ch=naver', 'ch', CHANNELS)).toBe('https://p.example/a?x=1&ch=naver#f');
    expect(applyChannel('https://p.example/a?ch=old', '?ch=daangn', 'ch', CHANNELS)).toBe('https://p.example/a?ch=daangn');
  });

  it('주소가 잘못돼도 예외 없이 원래 값을 돌려준다', () => {
    expect(applyChannel('not a url', '?ch=kakao', 'ch', CHANNELS)).toBe('not a url');
  });

  it('인라인 스크립트로 들어가도 동작하도록 바깥 변수에 기대지 않는다', () => {
    // toString 으로 꺼낸 소스만으로 다시 만든 함수도 똑같이 동작해야 한다
    const f = new Function(`return (${applyChannel.toString()})`)() as typeof applyChannel;
    expect(f(OP, '?ch=kakao', 'ch', [...CHANNELS])).toBe(`${OP}?ch=kakao`);
    expect(f(OP, '?ch=nope', 'ch', [...CHANNELS])).toBe(OP);
  });
});
