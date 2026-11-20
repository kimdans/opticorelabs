// 채널 태그: 랜딩 주소의 ?ch= 값이 허용 목록에 있으면, 상담 신청 버튼(운영사 주소)에 같은 값을 붙인다.
// 이 함수는 안내 페이지의 작은 인라인 스크립트에 소스 그대로(toString) 들어간다.
// 그래서 바깥 변수나 import를 쓰지 않고, 필요한 값은 모두 인자로 받는다.
// JS가 꺼져 있으면 버튼은 기본 주소 그대로 동작한다.

export const CHANNELS = ['daangn', 'kakao', 'naver', 'toss', 'meta'] as const;
export type Channel = (typeof CHANNELS)[number];

/**
 * @param href     버튼의 기본 주소 (운영사 URL)
 * @param search   랜딩 페이지의 location.search (예: "?ch=kakao")
 * @param param    운영사 주소에 붙일 파라미터 이름 (기본 'ch')
 * @param allowed  허용 채널 목록
 * @returns 채널이 허용 목록에 있으면 파라미터를 붙인 주소, 아니면 href 그대로
 */
export function applyChannel(href: string, search: string, param: string, allowed: readonly string[]): string {
  try {
    const ch = new URLSearchParams(search).get('ch');
    if (!ch || allowed.indexOf(ch) < 0) return href;
    const u = new URL(href);
    u.searchParams.set(param || 'ch', ch);
    return u.toString();
  } catch (e) {
    return href;
  }
}
