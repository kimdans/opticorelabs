import { defineConfig } from 'astro/config';

// 기본값은 GitHub Pages 프로젝트 사이트 주소(https://kimdans.github.io/opticorelabs/)다.
// 배포 워크플로(.github/workflows/pages.yml)가 실제 주소를 SITE_URL / BASE_PATH로 넘겨주므로,
// 저장소 이름을 바꾸거나 자체 도메인을 연결해도 이 파일은 고칠 필요가 없다.
export default defineConfig({
  site: process.env.SITE_URL || 'https://kimdans.github.io',
  base: process.env.BASE_PATH || '/opticorelabs',
  outDir: process.env.OUT_DIR || 'dist',
  trailingSlash: 'never',
  build: { format: 'file' },
});
