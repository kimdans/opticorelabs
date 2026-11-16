// 공통 모션: 부드러운 스크롤 + 섹션 등장. '동작 줄이기' 설정이면 아무것도 하지 않는다.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let started = false;
export function initMotion() {
  if (started || reduceMotion()) return;
  started = true;
  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // [data-reveal] 요소는 반쯤 보이는 상태에서 떠오른다 (스크롤 전에도 내용이 읽힌다).
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    const items = el.dataset.reveal === 'children' ? Array.from(el.children) : [el];
    gsap.from(items, { opacity: 0.2, y: 24, duration: 0.9, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', refreshPriority: -1 } });
  });
  addEventListener('load', () => ScrollTrigger.refresh());
}
