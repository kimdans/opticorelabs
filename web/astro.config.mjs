import { defineConfig } from 'astro/config';

// TODO: 실제 도메인이 정해지면 바꾸세요 (기획서 '결정 필요 사항').
export default defineConfig({
  site: 'https://opticore.kr',
  trailingSlash: 'never',
  build: { format: 'file' },
});
