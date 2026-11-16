// GitHub Pages는 사이트를 "/<저장소 이름>/" 아래에 올린다 (예: /opticorelabs/).
// 모든 내부 링크는 url()을 거쳐 그 앞부분(base)을 붙인다. 나중에 자체 도메인을 쓰면 base가 "/"가 되어 그대로 동작한다.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const url = (p = '/') => `${base}${p.startsWith('/') ? p : `/${p}`}`;
