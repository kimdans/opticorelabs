// 공통 모션: 부드러운 스크롤, 섹션 등장, 제목 단어 등장, 상단 진행 표시. '동작 줄이기' 설정이면 아무것도 하지 않는다.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 글자를 단어 단위 <span class="w">로 감싼다 (안쪽 태그는 그대로 둔다).
function splitWords(el: HTMLElement) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes: Text[] = [], out: HTMLElement[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach(n => {
    const frag = document.createDocumentFragment();
    n.data.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (!part.trim()) { frag.append(' '); return; }
      const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); out.push(s);
    });
    n.replaceWith(frag);
  });
  return out;
}

let started = false;
export function initMotion() {
  if (started || reduceMotion()) return;
  started = true;
  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // 상단 진행 표시: 페이지를 얼마나 읽었는지
  const bar = document.querySelector('[data-progress]');
  if (bar) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.2 } });

  // [data-reveal] 요소는 반쯤 보이는 상태에서 떠오른다 (스크롤 전에도 내용이 읽힌다).
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    const items = el.dataset.reveal === 'children' ? Array.from(el.children) : [el];
    gsap.from(items, { opacity: 0.6, y: 16, duration: 0.9, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', refreshPriority: -1 } });
  });

  // 섹션 제목: 단어가 하나씩 초점이 맞으며 올라온다.
  document.querySelectorAll<HTMLElement>('.sec-head h2').forEach(h => {
    gsap.from(splitWords(h), { yPercent: 55, opacity: 0, filter: 'blur(10px)', duration: 0.85, stagger: 0.05, ease: 'power3.out',
      clearProps: 'filter,transform,opacity', scrollTrigger: { trigger: h, start: 'top 88%' } });
  });
  addEventListener('load', () => ScrollTrigger.refresh());
}
