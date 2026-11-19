// 조리개 그림. open(0~1)만 바꾸면 날이 열리고 닫힌다. 진단에서 답을 고를 때마다 열리는 데 쓴다.
export function createIris(cv: HTMLCanvasElement) {
  const ctx = cv.getContext('2d')!;
  const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = { body: css('--body'), a: css('--blade-a'), b: css('--blade-b'), edge: css('--edge'), core: css('--core'), deep: css('--core-deep') };
  const N = 9, state = { open: 0.06, rot: 0 };
  let S = 0, dpr = 1;

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = S / 2, R = S * 0.46, r = Math.max(1.5, R * state.open);
    ctx.clearRect(0, 0, S, S);
    const g = ctx.createRadialGradient(c, c, 0, c, c, R);
    g.addColorStop(0, C.deep); g.addColorStop(1, C.body);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
    const k = R * 0.24; ctx.fillStyle = C.core; ctx.beginPath(); ctx.roundRect(c - k / 2, c - k / 2, k, k, k * 0.18); ctx.fill();
    const V = Array.from({ length: N + 2 }, (_, i) => { const a = state.rot + (i * Math.PI * 2) / N; return [c + Math.cos(a) * r, c + Math.sin(a) * r]; });
    const E = (i: number) => { const dx = V[i + 1][0] - V[i][0], dy = V[i + 1][1] - V[i][1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
    ctx.save(); ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.clip();
    for (let i = 0; i < N; i++) {
      const p1 = V[i + 1], p2 = V[i + 2], e1 = E(i), e2 = E(i + 1), L = R * 3;
      ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p1[0] + e1[0] * L, p1[1] + e1[1] * L);
      ctx.lineTo(p2[0] + e2[0] * L, p2[1] + e2[1] * L); ctx.lineTo(p2[0], p2[1]); ctx.closePath();
      ctx.fillStyle = i % 2 ? C.b : C.a; ctx.fill();
      ctx.strokeStyle = C.edge; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p1[0] + e1[0] * L, p1[1] + e1[1] * L); ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = C.edge; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c, c, R + 3, 0, Math.PI * 2); ctx.stroke();
  }
  function size() { dpr = Math.min(2, devicePixelRatio || 1); S = cv.clientWidth; cv.width = S * dpr; cv.height = S * dpr; draw(); }
  addEventListener('resize', size); size();
  return { state, draw };
}
