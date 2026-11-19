// 가벼운 등장 모션. [data-reveal] 요소(또는 "children"이면 그 자식들)가 화면에 들어올 때 한 번 떠오른다.
// 처음부터 화면 안에 있는 요소는 건드리지 않는다: 첫 화면은 스크립트 없이도 완성된 상태다.
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  if (reduceMotion() || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
    const items = el.dataset.reveal === 'children' ? (Array.from(el.children) as HTMLElement[]) : [el];
    items.forEach((it, i) => {
      if (it.getBoundingClientRect().top < innerHeight * 0.92) return;
      it.classList.add('rv'); it.style.setProperty('--d', String(i)); io.observe(it);
    });
  });
}
