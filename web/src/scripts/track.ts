// PRD '분석과 측정 이벤트'. 분석 도구가 정해지기 전까지는 이벤트를 window.dataLayer와 DOM 이벤트로만 내보낸다.
// 개인을 식별하는 값은 넣지 않는다.
type Props = Record<string, string | number | boolean>;
declare global { interface Window { dataLayer?: unknown[] } }

export function track(event: string, props: Props = {}) {
  window.dataLayer?.push({ event, ...props });
  window.dispatchEvent(new CustomEvent('opticore:track', { detail: { event, ...props } }));
}
